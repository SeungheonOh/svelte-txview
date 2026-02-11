<script lang="ts">
  import type { MintEntry } from '$lib/types/cardano';
  import { truncateHash } from '$lib/utils/format';

  let { entries }: { entries: MintEntry[] } = $props();

  function decodeAssetName(hex: string): string {
    if (!hex) return '(empty)';
    try {
      const bytes = hex.match(/.{1,2}/g);
      if (bytes) {
        const text = bytes.map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
        if (/^[\x20-\x7E]+$/.test(text)) return text;
      }
    } catch {}
    return hex || '(empty)';
  }
</script>

<div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold text-black">Minting / Burning</h2>
    <span class="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
      {entries.length} {entries.length === 1 ? 'policy' : 'policies'}
    </span>
  </div>

  <div class="space-y-3">
    {#each entries as entry}
      <div class="border border-gray-200 rounded p-3">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs text-gray-500">Policy ID</span>
          <span class="font-mono text-xs text-gray-700" title={entry.policyId}>
            {truncateHash(entry.policyId, 12, 8)}
          </span>
        </div>
        <div class="pl-2 border-l border-gray-200 space-y-1">
          {#each Object.entries(entry.assets) as [assetName, amount]}
            {@const isMint = amount > 0n}
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-600">
                {decodeAssetName(assetName)}
              </span>
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.5 rounded text-[10px] font-medium"
                  class:bg-green-100={isMint}
                  class:text-green-700={isMint}
                  class:bg-red-100={!isMint}
                  class:text-red-700={!isMint}>
                  {isMint ? 'Minted' : 'Burned'}
                </span>
                <span class="font-mono text-xs font-medium"
                  class:text-green-700={isMint}
                  class:text-red-700={!isMint}>
                  {isMint ? '+' : ''}{amount.toString()}
                </span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
