<script lang="ts">
  import type { Value } from '$lib/types/cardano';
  import { formatADA, formatAssetId } from '$lib/utils/format';

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
        {@const formatted = formatAssetId(assetId)}
        <div class="flex items-center justify-between gap-2" title={assetId}>
          <span class="text-xs text-gray-500 truncate">
            {#if formatted.displayName}
              <span class="text-gray-700">{formatted.displayName}</span>
              {#if formatted.policyId}
                <span class="text-[10px] text-gray-400 ml-1">{formatted.policyId}</span>
              {/if}
            {:else}
              {formatted.policyId}{#if formatted.assetName}.{formatted.assetName}{/if}
            {/if}
          </span>
          <span class="font-mono text-xs text-gray-600 shrink-0">
            {amount.toString()}
          </span>
        </div>
      {/each}
    </div>
  {/if}
</div>
