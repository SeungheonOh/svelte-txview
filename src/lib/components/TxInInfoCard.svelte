<script lang="ts">
  import type { TxInInfo } from '$lib/types/cardano';
  import AddressDisplay from './AddressDisplay.svelte';
  import ValueDisplay from './ValueDisplay.svelte';
  import DatumViewer from './DatumViewer.svelte';
  import { truncateHash } from '$lib/utils/format';

  let { 
    txInInfo,
    index,
    label,
    isReference = false
  }: {
    txInInfo: TxInInfo;
    index?: number;
    label?: string;
    isReference?: boolean;
  } = $props();
</script>

<div class="bg-white border rounded p-3 transition-colors border-gray-200 hover:border-gray-300">
  <div class="flex items-center justify-between mb-2">
    <div class="flex items-center gap-2">
      {#if label}
        <span class="text-xs font-medium text-gray-600 uppercase">{label}</span>
      {/if}
      {#if index !== undefined}
        <span class="text-xs text-gray-500 font-mono">#{index}</span>
      {/if}
    </div>
    <div class="flex items-center gap-2">
      {#if isReference}
        <span class="flex items-center gap-1 text-xs text-gray-600">
          <div class="w-1 h-1 bg-yellow-500 rounded-full"></div>
          Reference
        </span>
      {/if}
    </div>
  </div>

  <div class="mb-2">
    <AddressDisplay address={txInInfo.address} scriptHash={txInInfo.address_script_hash} />
  </div>  
  
  <div class="bg-gray-50 rounded p-1.5 mb-2">
    <div class="flex items-center gap-3 text-xs">
      <span class="text-gray-500">Tx: <span class="font-mono text-gray-700">{truncateHash(txInInfo.transaction_id, 8, 6)}</span></span>
      <span class="text-gray-500">Idx: <span class="font-mono text-gray-700">#{txInInfo.output_index}</span></span>
    </div>
  </div>  

  <div class="pt-2 border-t border-gray-100">
    <ValueDisplay value={txInInfo.value} />
  </div>

  <DatumViewer 
    datum={txInInfo.datum}
    datumHash={txInInfo.datum_hash}
    isInline={txInInfo.datum_inline}
    formatter={txInInfo.datumFormatter}
  />
</div>