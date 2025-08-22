<script lang="ts">
  import type { Address } from '$lib/types/cardano';
  import { formatAddress, getAddressValue } from '$lib/utils/format';

  let { 
    address,
    scriptHash
  }: {
    address: string | Address;
    scriptHash?: string;
  } = $props();

  let copied = $state(false);

  const formattedAddress = $derived(formatAddress(address, 12));
  const fullAddress = $derived(getAddressValue(address));

  async function copyAddress() {
    await navigator.clipboard.writeText(fullAddress);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }
</script>

<div class="flex items-center gap-2">
  <button
    onclick={copyAddress}
    class="group flex items-center gap-1.5 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
    title={fullAddress}
  >
    <div class="flex flex-col items-start">
      {#if formattedAddress.alias}
        <span class="text-xs font-medium text-gray-900">
          {formattedAddress.alias}
        </span>
        <span class="font-mono text-[10px] text-gray-500">
          {formattedAddress.address}
        </span>
      {:else}
        <span class="font-mono text-xs text-gray-700">
          {formattedAddress.address}
        </span>
      {/if}
    </div>
    {#if copied}
      <svg class="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    {:else}
      <svg class="w-3 h-3 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    {/if}
  </button>
  
  {#if scriptHash}
    <span class="flex items-center gap-1 text-xs text-gray-600">
      <div class="w-1 h-1 bg-blue-500 rounded-full"></div>
      Script
    </span>
  {/if}
</div>