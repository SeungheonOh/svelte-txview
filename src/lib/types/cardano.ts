export type DetailedSchema = any;

export type DatumFormatter = (datum: any) => {
  label?: string;
  formatted: string | { [key: string]: any };
};

export type MultiAsset = { 
  [key: string]: bigint 
};

export type Value = { 
  coins: bigint;
  assets?: MultiAsset;
};

export type Address = {
  value: string;
  alias?: string;
};

export type TxOut = {
  address: string | Address;
  address_script_hash?: string;
  value: Value;
  datum_hash?: string;
  datum?: DetailedSchema;
  datum_inline: boolean;
  datumFormatter?: DatumFormatter;
};

export type TxInInfo = {
  transaction_id: string;
  output_index: bigint;
} & TxOut;

export type Witness = {
  value: string;
  alias?: string;
};

export type Signer = {
  value: string;
  alias?: string;
};

export type TxInfo = {
  txHash: string;
  txRaw: string;
  txOuts: TxOut[];
  txInInfos: TxInInfo[];
  txRefInInfos: TxInInfo[];
  signers: (string | Signer)[];
  witnesses: (string | Witness)[];
  validityIntervalStart?: number;
  ttl?: number;
  fee: number;
};