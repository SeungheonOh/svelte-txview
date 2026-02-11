<script lang="ts">
  import type { TxInInfo, TxOut } from '$lib/types/cardano';
  import { formatADA } from '$lib/utils/format';
  import TxInInfoCard from './TxInInfoCard.svelte';
  import TxOutCard from './TxOutCard.svelte';

  let {
    collaterals,
    collateralReturn,
    totalCollateral
  }: {
    collaterals: TxInInfo[];
    collateralReturn?: TxOut;
    totalCollateral?: bigint;
  } = $props();
</script>

<div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold text-black">Collateral</h2>
    <div class="flex items-center gap-2">
      <span class="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
        {collaterals.length} {collaterals.length === 1 ? 'input' : 'inputs'}
      </span>
      {#if totalCollateral !== undefined}
        <span class="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
          {formatADA(totalCollateral)} ADA
        </span>
      {/if}
    </div>
  </div>

  <div class="space-y-2">
    {#each collaterals as col, i}
      <TxInInfoCard txInInfo={col} index={i} label="Collateral" />
    {/each}
  </div>

  {#if collateralReturn}
    <div class="mt-4 pt-4 border-t border-gray-200">
      <h3 class="text-sm font-medium text-gray-600 mb-2">Collateral Return</h3>
      <TxOutCard txOut={collateralReturn} label="Return" />
    </div>
  {/if}
</div>
