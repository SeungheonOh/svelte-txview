import type { Address, Witness, Signer } from '$lib/types/cardano';

export function formatADA(lovelace: bigint): string {
  const ada = Number(lovelace) / 1_000_000;
  return ada.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

export function formatAssetName(policyId: string): string {
  const hexMatch = policyId.match(/^[0-9a-f]+$/i);
  if (hexMatch) {
    try {
      const bytes = policyId.match(/.{1,2}/g);
      if (bytes) {
        const text = bytes.map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
        if (/^[\x20-\x7E]+$/.test(text)) {
          return text;
        }
      }
    } catch {}
  }
  return policyId;
}

export function truncateHash(hash: string, startLength: number = 6, endLength: number = 6): string {
  if (hash.length <= startLength + endLength) {
    return hash;
  }
  return `${hash.slice(0, startLength)}...${hash.slice(-endLength)}`;
}

export function getAddressValue(address: string | Address): string {
  return typeof address === 'string' ? address : address.value;
}

export function getAddressAlias(address: string | Address): string | undefined {
  return typeof address === 'string' ? undefined : address.alias;
}

export function formatAddress(address: string | Address, truncateLength?: number): { alias?: string; address: string } {
  const alias = getAddressAlias(address);
  const value = getAddressValue(address);
  const displayAddress = truncateLength ? truncateHash(value, truncateLength, truncateLength) : value;
  
  return {
    alias,
    address: displayAddress
  };
}

export function getWitnessValue(witness: string | Witness): string {
  return typeof witness === 'string' ? witness : witness.value;
}

export function getWitnessAlias(witness: string | Witness): string | undefined {
  return typeof witness === 'string' ? undefined : witness.alias;
}

export function getSignerValue(signer: string | Signer): string {
  return typeof signer === 'string' ? signer : signer.value;
}

export function getSignerAlias(signer: string | Signer): string | undefined {
  return typeof signer === 'string' ? undefined : signer.alias;
}

export function formatWitness(witness: string | Witness, truncateLength?: number): { alias?: string; witness: string } {
  const alias = getWitnessAlias(witness);
  const value = getWitnessValue(witness);
  const displayWitness = truncateLength ? truncateHash(value, truncateLength, truncateLength) : value;
  
  return {
    alias,
    witness: displayWitness
  };
}

export function formatSigner(signer: string | Signer, truncateLength?: number): { alias?: string; signer: string } {
  const alias = getSignerAlias(signer);
  const value = getSignerValue(signer);
  const displaySigner = truncateLength ? truncateHash(value, truncateLength, truncateLength) : value;
  
  return {
    alias,
    signer: displaySigner
  };
}