<script lang="ts">
  import type { TxOut } from '$lib/types/cardano';
  import AddressDisplay from './AddressDisplay.svelte';
  import ValueDisplay from './ValueDisplay.svelte';
  import DatumViewer from './DatumViewer.svelte';

  let { 
    txOut,
    index,
    label
  }: {
    txOut: TxOut;
    index?: number;
    label?: string;
  } = $props();
</script>

<div class="bg-white border border-gray-200 rounded p-3 hover:border-gray-300 transition-colors">
  <div class="flex items-center justify-between mb-2">
    <div class="flex items-center gap-2">
      {#if label}
        <span class="text-xs font-medium text-gray-600 uppercase">{label}</span>
      {/if}
      {#if index !== undefined}
        <span class="text-xs text-gray-500 font-mono">#{index}</span>
      {/if}
    </div>
  </div>
  
  <div class="mb-2">
    <AddressDisplay address={txOut.address} scriptHash={txOut.address_script_hash} />
  </div>
  
  <div class="pt-2 border-t border-gray-100">
    <ValueDisplay value={txOut.value} />
  </div>

  <DatumViewer 
    datum={txOut.datum}
    datumHash={txOut.datum_hash}
    isInline={txOut.datum_inline}
    formatter={txOut.datumFormatter}
  />
</div>