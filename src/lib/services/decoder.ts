import { Serialization, type Cardano } from '@cardano-sdk/core';
import type { BlockfrostClient } from './blockfrost';
import type {
  TxInfo,
  TxOut,
  TxInInfo,
  MintEntry,
  Certificate,
  Redeemer,
  Withdrawal,
  MultiAsset
} from '$lib/types/cardano';

export function decodeCborTx(cborHex: string): Cardano.Tx {
  const cleaned = cborHex.trim();
  return Serialization.deserializeTx(Serialization.TxCBOR(cleaned));
}

function tokenMapToMultiAsset(tokenMap: Cardano.TokenMap | undefined): MultiAsset | undefined {
  if (!tokenMap || tokenMap.size === 0) return undefined;
  const result: MultiAsset = {};
  tokenMap.forEach((quantity, assetId) => {
    result[assetId] = quantity;
  });
  return result;
}

function plutusDataToJson(data: Cardano.PlutusData | undefined): any {
  if (data === undefined || data === null) return undefined;
  // PlutusData can be various forms; serialize to a JSON-friendly representation
  try {
    if (typeof data === 'bigint') return data.toString();
    if (typeof data === 'number') return data;
    if (typeof data === 'string') return data;
    if (data instanceof Map) {
      const obj: Record<string, any> = {};
      data.forEach((v, k) => {
        obj[String(plutusDataToJson(k))] = plutusDataToJson(v);
      });
      return obj;
    }
    if (Array.isArray(data)) {
      return data.map(plutusDataToJson);
    }
    if (typeof data === 'object' && data !== null) {
      // Constr
      const d = data as any;
      if ('constructor' in d && 'fields' in d) {
        return {
          constructor: typeof d.constructor === 'bigint' ? Number(d.constructor) : d.constructor,
          fields: Array.isArray(d.fields) ? d.fields.map(plutusDataToJson) : d.fields
        };
      }
      if (d.cbor) return d.cbor;
      // Generic object fallback
      const result: Record<string, any> = {};
      for (const [k, v] of Object.entries(d)) {
        result[k] = plutusDataToJson(v as any);
      }
      return result;
    }
    return String(data);
  } catch {
    return String(data);
  }
}

function mapCoreOutput(output: Cardano.TxOut): TxOut {
  const hasInlineDatum = output.datum !== undefined && output.datum !== null;
  return {
    address: String(output.address),
    value: {
      coins: output.value.coins,
      assets: tokenMapToMultiAsset(output.value.assets)
    },
    datum_inline: hasInlineDatum,
    datum: hasInlineDatum ? plutusDataToJson(output.datum) : undefined,
    datum_hash: output.datumHash ? String(output.datumHash) : undefined,
    address_script_hash: output.scriptReference ? 'has_script' : undefined
  };
}

function mapCertificateType(cert: Cardano.Certificate): Certificate {
  const c = cert as any;
  const type = c.__typename || c.type || getCertificateTypeName(cert);
  const detail: Record<string, any> = {};

  // Extract known fields based on certificate structure
  if ('stakeCredential' in c) {
    detail.stakeCredential = String(c.stakeCredential?.hash || c.stakeCredential);
  }
  if ('poolId' in c) {
    detail.poolId = String(c.poolId);
  }
  if ('epoch' in c) {
    detail.epoch = Number(c.epoch);
  }
  if ('deposit' in c) {
    detail.deposit = String(c.deposit);
  }
  if ('anchor' in c && c.anchor) {
    detail.anchor = { url: c.anchor.url, dataHash: String(c.anchor.dataHash) };
  }
  if ('dRep' in c) {
    detail.dRep = String(c.dRep?.hash || c.dRep);
  }

  return { type, detail };
}

function getCertificateTypeName(cert: Cardano.Certificate): string {
  const c = cert as any;
  if (c.__typename) return c.__typename;
  // Try to determine from known discriminators
  if ('poolParameters' in c) return 'PoolRegistration';
  if ('poolId' in c && 'epoch' in c) return 'PoolRetirement';
  if ('stakeCredential' in c && 'poolId' in c) return 'StakeDelegation';
  if ('stakeCredential' in c && 'deposit' in c) return 'StakeRegistration';
  if ('stakeCredential' in c) return 'StakeDeregistration';
  if ('dRep' in c) return 'VoteDelegation';
  return 'Unknown';
}

function mapRedeemer(r: Cardano.Redeemer): Redeemer {
  return {
    purpose: String(r.purpose),
    index: r.index,
    data: plutusDataToJson(r.data),
    exUnits: {
      mem: BigInt(r.executionUnits.memory),
      steps: BigInt(r.executionUnits.steps)
    }
  };
}

async function resolveInputs(
  inputs: Cardano.TxIn[],
  blockfrost: BlockfrostClient,
  onProgress?: (msg: string) => void
): Promise<TxInInfo[]> {
  const result: TxInInfo[] = [];

  // Deduplicate by txId
  const uniqueTxIds = [...new Set(inputs.map((i) => String(i.txId)))];

  for (let ti = 0; ti < uniqueTxIds.length; ti++) {
    onProgress?.(`Resolving inputs from tx ${ti + 1}/${uniqueTxIds.length}...`);
    // Pre-fetch to cache
    try {
      await blockfrost.getTransactionUtxos(uniqueTxIds[ti]);
    } catch (e: any) {
      console.warn(`Failed to fetch utxos for ${uniqueTxIds[ti]}: ${e.message}`);
    }
  }

  for (const input of inputs) {
    const txId = String(input.txId);
    try {
      const resolved = await blockfrost.resolveInput(txId, input.index);
      result.push({
        transaction_id: txId,
        output_index: BigInt(input.index),
        address: resolved.address,
        value: {
          coins: resolved.lovelace,
          assets: Object.keys(resolved.assets).length > 0 ? resolved.assets : undefined
        },
        datum_inline: resolved.inlineDatum !== null,
        datum: resolved.inlineDatum ?? undefined,
        datum_hash: resolved.datumHash ?? undefined,
        address_script_hash: resolved.scriptHash ?? undefined
      });
    } catch (e: any) {
      // If we can't resolve, still include the input with minimal info
      result.push({
        transaction_id: txId,
        output_index: BigInt(input.index),
        address: 'Unresolved',
        value: { coins: 0n },
        datum_inline: false
      });
    }
  }

  return result;
}

export async function buildTxInfo(
  cborHex: string,
  blockfrost: BlockfrostClient,
  onProgress?: (msg: string) => void
): Promise<TxInfo> {
  onProgress?.('Decoding CBOR...');
  const coreTx = decodeCborTx(cborHex);

  const body = coreTx.body;
  const witness = coreTx.witness;

  // Resolve inputs
  onProgress?.('Resolving transaction inputs...');
  const txInInfos = await resolveInputs(body.inputs, blockfrost, onProgress);

  // Resolve reference inputs
  let txRefInInfos: TxInInfo[] = [];
  if (body.referenceInputs && body.referenceInputs.length > 0) {
    onProgress?.('Resolving reference inputs...');
    txRefInInfos = await resolveInputs(body.referenceInputs, blockfrost, onProgress);
  }

  // Resolve collaterals
  let collaterals: TxInInfo[] | undefined;
  if (body.collaterals && body.collaterals.length > 0) {
    onProgress?.('Resolving collateral inputs...');
    collaterals = await resolveInputs(body.collaterals, blockfrost, onProgress);
  }

  // Map outputs
  onProgress?.('Mapping outputs...');
  const txOuts: TxOut[] = body.outputs.map(mapCoreOutput);

  // Map collateral return
  const collateralReturn = body.collateralReturn
    ? mapCoreOutput(body.collateralReturn)
    : undefined;

  // Signers
  const signers: string[] = body.requiredExtraSignatures
    ? body.requiredExtraSignatures.map(String)
    : [];

  // Witnesses (signatures)
  const witnesses: string[] = [];
  if (witness.signatures) {
    witness.signatures.forEach((sig, pubKey) => {
      witnesses.push(String(pubKey));
    });
  }

  // Mint
  let mint: MintEntry[] | undefined;
  if (body.mint && body.mint.size > 0) {
    const mintMap = new Map<string, { [assetName: string]: bigint }>();
    body.mint.forEach((quantity, assetId) => {
      const id = String(assetId);
      const policyId = id.slice(0, 56);
      const assetName = id.slice(56) || '';
      if (!mintMap.has(policyId)) {
        mintMap.set(policyId, {});
      }
      mintMap.get(policyId)![assetName] = quantity;
    });
    mint = Array.from(mintMap.entries()).map(([policyId, assets]) => ({
      policyId,
      assets
    }));
  }

  // Certificates
  let certificates: Certificate[] | undefined;
  if (body.certificates && body.certificates.length > 0) {
    certificates = body.certificates.map(mapCertificateType);
  }

  // Redeemers
  let redeemers: Redeemer[] | undefined;
  if (witness.redeemers && witness.redeemers.length > 0) {
    redeemers = witness.redeemers.map(mapRedeemer);
  }

  // Withdrawals
  let withdrawals: Withdrawal[] | undefined;
  if (body.withdrawals && body.withdrawals.length > 0) {
    withdrawals = body.withdrawals.map((w) => ({
      stakeAddress: String(w.stakeAddress),
      amount: w.quantity
    }));
  }

  // Metadata
  let metadata: Record<string, any> | undefined;
  if (coreTx.auxiliaryData) {
    const aux = coreTx.auxiliaryData as any;
    if (aux.blob) {
      metadata = {};
      if (aux.blob instanceof Map) {
        aux.blob.forEach((v: any, k: any) => {
          metadata![String(k)] = v;
        });
      } else {
        metadata = aux.blob;
      }
    } else {
      metadata = aux;
    }
  }

  // Validity interval
  const validityIntervalStart = body.validityInterval?.invalidBefore
    ? Number(body.validityInterval.invalidBefore)
    : undefined;
  const ttl = body.validityInterval?.invalidHereafter
    ? Number(body.validityInterval.invalidHereafter)
    : undefined;

  onProgress?.('Done!');

  return {
    txHash: String(coreTx.id),
    txRaw: cborHex,
    txOuts,
    txInInfos,
    txRefInInfos,
    signers,
    witnesses,
    validityIntervalStart,
    ttl,
    fee: Number(body.fee),
    mint,
    certificates,
    redeemers,
    withdrawals,
    metadata,
    collaterals,
    collateralReturn,
    totalCollateral: body.totalCollateral,
    scriptIntegrityHash: body.scriptIntegrityHash
      ? String(body.scriptIntegrityHash)
      : undefined,
    networkId: body.networkId,
    isValid: coreTx.isValid
  };
}
