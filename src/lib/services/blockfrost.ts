const NETWORK_URLS: Record<string, string> = {
  mainnet: 'https://cardano-mainnet.blockfrost.io/api/v0',
  preprod: 'https://cardano-preprod.blockfrost.io/api/v0',
  preview: 'https://cardano-preview.blockfrost.io/api/v0'
};

export type Network = 'mainnet' | 'preprod' | 'preview';

type BlockfrostUtxo = {
  address: string;
  tx_hash: string;
  tx_index: number;
  output_index: number;
  amount: { unit: string; quantity: string }[];
  inline_datum: string | null;
  data_hash: string | null;
  reference_script_hash: string | null;
};

type BlockfrostTxUtxos = {
  hash: string;
  inputs: BlockfrostUtxo[];
  outputs: BlockfrostUtxo[];
};

export type ResolvedUtxo = {
  address: string;
  outputIndex: number;
  lovelace: bigint;
  assets: { [assetId: string]: bigint };
  datumHash: string | null;
  inlineDatum: any | null;
  scriptHash: string | null;
};

export class BlockfrostClient {
  private baseUrl: string;
  private apiKey: string;
  private cache = new Map<string, BlockfrostTxUtxos>();

  constructor(apiKey: string, network: Network) {
    this.apiKey = apiKey;
    this.baseUrl = NETWORK_URLS[network];
    if (!this.baseUrl) {
      throw new Error(`Unknown network: ${network}`);
    }
  }

  private async request<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { project_id: this.apiKey }
    });

    if (!res.ok) {
      if (res.status === 403) {
        throw new Error('Invalid API key or wrong network for this key');
      }
      if (res.status === 404) {
        throw new Error(`Not found: ${path}`);
      }
      if (res.status === 429) {
        throw new Error('Blockfrost rate limit exceeded. Please wait and try again.');
      }
      const body = await res.text();
      throw new Error(`Blockfrost API error (${res.status}): ${body}`);
    }

    return res.json();
  }

  async getTransactionUtxos(txHash: string): Promise<BlockfrostTxUtxos> {
    const cached = this.cache.get(txHash);
    if (cached) return cached;

    const result = await this.request<BlockfrostTxUtxos>(`/txs/${txHash}/utxos`);
    this.cache.set(txHash, result);
    return result;
  }

  async resolveInput(txHash: string, outputIndex: number): Promise<ResolvedUtxo> {
    const utxos = await this.getTransactionUtxos(txHash);
    const output = utxos.outputs.find((o) => o.output_index === outputIndex);

    if (!output) {
      throw new Error(`Output index ${outputIndex} not found in tx ${txHash}`);
    }

    const lovelace = BigInt(
      output.amount.find((a) => a.unit === 'lovelace')?.quantity ?? '0'
    );

    const assets: { [assetId: string]: bigint } = {};
    for (const a of output.amount) {
      if (a.unit !== 'lovelace') {
        assets[a.unit] = BigInt(a.quantity);
      }
    }

    let inlineDatum: any = null;
    if (output.inline_datum) {
      try {
        inlineDatum = JSON.parse(output.inline_datum);
      } catch {
        inlineDatum = output.inline_datum;
      }
    }

    return {
      address: output.address,
      outputIndex: output.output_index,
      lovelace,
      assets,
      datumHash: output.data_hash,
      inlineDatum,
      scriptHash: output.reference_script_hash
    };
  }

  async getDatum(datumHash: string): Promise<any> {
    try {
      const result = await this.request<{ json_value: any }>(`/scripts/datum/${datumHash}`);
      return result.json_value;
    } catch {
      return null;
    }
  }
}
