import type { DatumFormatter } from '$lib/types/cardano';

// -- Helpers for extracting values from Plutus JSON datum format --

function getBytes(field: any): string {
  return field?.bytes ?? '';
}

function getInt(field: any): number {
  return field?.int ?? 0;
}

function getBytesList(field: any): string[] {
  if (!field?.list) return [];
  return field.list.map((item: any) => getBytes(item));
}

function isBoolTrue(field: any): boolean {
  // PBool: Constr 1 [] = True, Constr 0 [] = False
  return field?.constructor === 1;
}

function formatPlutusAddress(field: any): string {
  // PAddress = Constr 0 [Credential, MaybeStakingCredential]
  if (field?.constructor !== 0 || !field.fields || field.fields.length < 2) {
    return JSON.stringify(field);
  }
  const cred = field.fields[0];
  const stakeCred = field.fields[1];

  // Credential: PubKeyCredential (Constr 0 [hash]) | ScriptCredential (Constr 1 [hash])
  const credType = cred?.constructor === 0 ? 'PubKey' : 'Script';
  const credHash = cred?.fields?.[0]?.bytes ?? '';

  let stakeStr = '';
  // MaybeStakingCredential: Just (Constr 0 [StakingCredential]) | Nothing (Constr 1 [])
  if (stakeCred?.constructor === 0 && stakeCred.fields?.length > 0) {
    const inner = stakeCred.fields[0];
    // StakingHash (Constr 0 [Credential])
    if (inner?.constructor === 0 && inner.fields?.length > 0) {
      const sc = inner.fields[0];
      const scType = sc?.constructor === 0 ? 'PubKey' : 'Script';
      const scHash = sc?.fields?.[0]?.bytes ?? '';
      stakeStr = ` / Stake(${scType}: ${scHash})`;
    }
  }

  return `${credType}: ${credHash}${stakeStr}`;
}

function truncate(s: string, n: number = 16): string {
  if (s.length <= n) return s;
  return s.slice(0, n) + '...';
}

// -- USDCXProtocolParameters formatter --

const formatUSDCXProtocolParameters: DatumFormatter = (datum: any) => {
  if (datum?.constructor !== 0 || !Array.isArray(datum?.fields) || datum.fields.length < 11) {
    return { label: 'USDCXProtocolParameters', formatted: datum };
  }

  const f = datum.fields;
  return {
    label: 'USDCXProtocolParameters',
    formatted: {
      mintingLogicScriptHash: getBytes(f[0]),
      feeScriptAddress: formatPlutusAddress(f[1]),
      usdcxPolicyId: getBytes(f[2]),
      circleAttestationKeys: getBytesList(f[3]),
      cardanoAttestationKeys: getBytesList(f[4]),
      domainManagerKey: getBytes(f[5]),
      adminKeys: getBytesList(f[6]),
      adminSignatureThreshold: getInt(f[7]),
      isPaused: isBoolTrue(f[8]),
      nonceListScriptHash: getBytes(f[9]),
      minDepositFee: `${(getInt(f[10]) / 1_000_000).toFixed(2)} ADA (${getInt(f[10])} lovelace)`
    }
  };
};

// -- Formatter registry: token name (ASCII) -> formatter --

const FORMATTER_REGISTRY: Record<string, DatumFormatter> = {
  'USDCXProtocolParameters': formatUSDCXProtocolParameters
};

/**
 * Find a datum formatter for a given output based on its assets.
 * Matches by checking if any asset's token name (hex-decoded) matches a registered formatter.
 */
export function findDatumFormatter(assets?: Record<string, bigint>): DatumFormatter | undefined {
  if (!assets) return undefined;

  for (const assetId of Object.keys(assets)) {
    // Asset ID = policyId (56 hex chars) + tokenName (hex)
    const tokenNameHex = assetId.length > 56 ? assetId.slice(56) : assetId;
    if (!tokenNameHex) continue;

    // Try to decode token name hex to ASCII
    try {
      const bytes = tokenNameHex.match(/.{1,2}/g);
      if (bytes) {
        const tokenName = bytes.map(b => String.fromCharCode(parseInt(b, 16))).join('');
        if (FORMATTER_REGISTRY[tokenName]) {
          return FORMATTER_REGISTRY[tokenName];
        }
      }
    } catch {
      // skip
    }
  }

  return undefined;
}
