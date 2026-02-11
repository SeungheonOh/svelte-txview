<script lang="ts">
  import { slide } from 'svelte/transition';

  let { metadata }: { metadata: Record<string, any> } = $props();

  let expanded = $state(false);
  let copied = $state(false);

  function formatJson(obj: any): string {
    try {
      return JSON.stringify(obj, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      , 2);
    } catch {
      return String(obj);
    }
  }

  async function copyMetadata() {
    await navigator.clipboard.writeText(formatJson(metadata));
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  const metadataKeys = $derived(Object.keys(metadata));
</script>

<div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold text-black">Metadata</h2>
    <div class="flex items-center gap-2">
      <span class="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
        {metadataKeys.length} {metadataKeys.length === 1 ? 'label' : 'labels'}
      </span>
      <button
        onclick={copyMetadata}
        class="p-1 hover:bg-gray-100 rounded transition-colors"
        title="Copy metadata"
      >
        {#if copied}
          <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        {:else}
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        {/if}
      </button>
    </div>
  </div>

  {#each metadataKeys as key}
    {@const value = metadata[key]}
    <div class="border border-gray-200 rounded mb-2">
      <button
        class="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors text-left"
        onclick={() => expanded = !expanded}
      >
        <div class="flex items-center gap-2">
          <span class="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-mono font-medium">
            {key}
          </span>
          <span class="text-xs text-gray-500">
            {typeof value === 'object' ? (Array.isArray(value) ? `Array[${value.length}]` : 'Object') : typeof value}
          </span>
        </div>
        <svg
          class="w-4 h-4 text-gray-400 transition-transform"
          class:rotate-180={expanded}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {#if expanded}
        <div class="px-3 pb-3" transition:slide={{ duration: 200 }}>
          <pre class="text-xs font-mono text-gray-700 bg-gray-50 rounded p-3 overflow-x-auto max-h-64 overflow-y-auto">{formatJson(value)}</pre>
        </div>
      {/if}
    </div>
  {/each}
</div>
