<script lang="ts">
  import type { Value } from '$lib/types/cardano';
  import { formatADA, formatAssetName } from '$lib/utils/format';

  let { value }: { value: Value } = $props();
</script>

<div class="space-y-1">
  <div class="flex items-center justify-between">
    <span class="text-xs text-gray-500">ADA</span>
    <span class="font-mono text-xs font-medium text-black">
      {formatADA(value.coins)}
    </span>
  </div>
  
  {#if value.assets && Object.keys(value.assets).length > 0}
    <div class="pl-2 border-l border-gray-200 space-y-0.5">
      {#each Object.entries(value.assets) as [assetId, amount]}
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">
            {formatAssetName(assetId)}
          </span>
          <span class="font-mono text-xs text-gray-600">
            {amount.toString()}
          </span>
        </div>
      {/each}
    </div>
  {/if}
</div>