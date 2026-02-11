<script lang="ts">
  import type { Redeemer } from '$lib/types/cardano';
  import { slide } from 'svelte/transition';

  let { redeemers }: { redeemers: Redeemer[] } = $props();

  let expandedIndex = $state<number | null>(null);

  const purposeColors: Record<string, string> = {
    spend: 'bg-blue-100 text-blue-700',
    mint: 'bg-green-100 text-green-700',
    cert: 'bg-purple-100 text-purple-700',
    certificate: 'bg-purple-100 text-purple-700',
    reward: 'bg-orange-100 text-orange-700',
    withdrawal: 'bg-orange-100 text-orange-700',
    propose: 'bg-indigo-100 text-indigo-700',
    vote: 'bg-pink-100 text-pink-700'
  };

  function getPurposeColor(purpose: string): string {
    return purposeColors[purpose.toLowerCase()] || 'bg-gray-100 text-gray-700';
  }

  function formatJson(obj: any): string {
    try {
      return JSON.stringify(obj, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      , 2);
    } catch {
      return String(obj);
    }
  }

  function formatExUnits(mem: bigint, steps: bigint): string {
    const fmtMem = mem > 1_000_000n ? `${(Number(mem) / 1_000_000).toFixed(1)}M` : mem.toString();
    const fmtSteps = steps > 1_000_000n ? `${(Number(steps) / 1_000_000).toFixed(1)}M` : steps.toString();
    return `${fmtMem} mem / ${fmtSteps} steps`;
  }
</script>

<div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold text-black">Redeemers</h2>
    <span class="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
      {redeemers.length}
    </span>
  </div>

  <div class="space-y-2">
    {#each redeemers as redeemer, i}
      <div class="border border-gray-200 rounded">
        <button
          class="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors text-left"
          onclick={() => expandedIndex = expandedIndex === i ? null : i}
        >
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500 font-mono">#{redeemer.index}</span>
            <span class="px-2 py-0.5 rounded text-xs font-medium {getPurposeColor(redeemer.purpose)}">
              {redeemer.purpose}
            </span>
            <span class="text-[10px] text-gray-400 font-mono">
              {formatExUnits(redeemer.exUnits.mem, redeemer.exUnits.steps)}
            </span>
          </div>
          <svg
            class="w-4 h-4 text-gray-400 transition-transform"
            class:rotate-180={expandedIndex === i}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {#if expandedIndex === i}
          <div class="px-3 pb-3" transition:slide={{ duration: 200 }}>
            <div class="grid grid-cols-2 gap-2 mb-2">
              <div class="text-xs">
                <span class="text-gray-500">Memory:</span>
                <span class="font-mono text-gray-700 ml-1">{redeemer.exUnits.mem.toString()}</span>
              </div>
              <div class="text-xs">
                <span class="text-gray-500">CPU Steps:</span>
                <span class="font-mono text-gray-700 ml-1">{redeemer.exUnits.steps.toString()}</span>
              </div>
            </div>
            <div>
              <span class="text-xs text-gray-500">Data:</span>
              <pre class="text-xs font-mono text-gray-700 bg-gray-50 rounded p-3 mt-1 overflow-x-auto max-h-48 overflow-y-auto">{formatJson(redeemer.data)}</pre>
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
