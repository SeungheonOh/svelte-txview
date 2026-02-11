<script lang="ts">
  import { browser } from '$app/environment';
  import TransactionViewer from '$lib/components/TransactionViewer.svelte';
  import { BlockfrostClient, type Network } from '$lib/services/blockfrost';
  import { buildTxInfo } from '$lib/services/decoder';
  import type { TxInfo } from '$lib/types/cardano';

  let network = $state<Network>('mainnet');
  let apiKey = $state(browser ? localStorage.getItem('blockfrost_api_key') || '' : '');
  let cborHex = $state('');
  let transaction = $state<TxInfo | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let progress = $state('');

  function saveApiKey() {
    if (browser) {
      if (apiKey) {
        localStorage.setItem('blockfrost_api_key', apiKey);
      } else {
        localStorage.removeItem('blockfrost_api_key');
      }
    }
  }

  async function decode() {
    if (!cborHex.trim()) {
      error = 'Please paste a CBOR hex string';
      return;
    }
    if (!apiKey.trim()) {
      error = 'Please enter a Blockfrost API key';
      return;
    }

    loading = true;
    error = null;
    transaction = null;

    try {
      saveApiKey();
      const client = new BlockfrostClient(apiKey.trim(), network);
      transaction = await buildTxInfo(cborHex.trim(), client, (msg) => progress = msg);
    } catch (e: any) {
      error = e.message || 'Failed to decode transaction';
    } finally {
      loading = false;
      progress = '';
    }
  }

  const networkColors: Record<Network, string> = {
    mainnet: 'bg-green-500',
    preprod: 'bg-yellow-500',
    preview: 'bg-blue-500'
  };
</script>

<svelte:head>
  <title>Cardano Transaction Viewer</title>
</svelte:head>

<!-- Header -->
<div class="border-b border-gray-200 bg-white">
  <div class="max-w-7xl mx-auto px-4 py-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-black">Cardano Transaction Viewer</h1>
        <p class="text-sm text-gray-600 mt-1">Decode and inspect CBOR transactions</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="flex items-center gap-1.5 text-xs text-gray-600">
          <div class="w-2 h-2 {networkColors[network]} rounded-full animate-pulse"></div>
          {network.charAt(0).toUpperCase() + network.slice(1)}
        </span>
      </div>
    </div>
  </div>
</div>

<!-- Configuration -->
<div class="max-w-7xl mx-auto px-4 py-6 space-y-4">
  <!-- Network + API Key row -->
  <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
    <div class="flex flex-col md:flex-row gap-4">
      <!-- Network selector -->
      <div class="flex-shrink-0">
        <label for="network" class="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Network</label>
        <select
          id="network"
          bind:value={network}
          class="block w-full md:w-40 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
        >
          <option value="mainnet">Mainnet</option>
          <option value="preprod">Preprod</option>
          <option value="preview">Preview</option>
        </select>
      </div>

      <!-- API Key -->
      <div class="flex-1">
        <label for="apikey" class="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Blockfrost API Key</label>
        <input
          id="apikey"
          type="password"
          bind:value={apiKey}
          onblur={saveApiKey}
          placeholder="Enter your Blockfrost project_id..."
          class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
        />
      </div>
    </div>
  </div>

  <!-- CBOR Input -->
  <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
    <label for="cbor" class="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Transaction CBOR Hex</label>
    <textarea
      id="cbor"
      bind:value={cborHex}
      placeholder="Paste your transaction CBOR hex here..."
      rows="6"
      class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-y"
    ></textarea>
    <div class="mt-3 flex items-center gap-3">
      <button
        onclick={decode}
        disabled={loading}
        class="px-6 py-2.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if loading}
          Decoding...
        {:else}
          Decode Transaction
        {/if}
      </button>
      {#if loading && progress}
        <span class="text-sm text-gray-500">{progress}</span>
      {/if}
    </div>
  </div>

  <!-- Error display -->
  {#if error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-red-800">Decode Error</h3>
          <p class="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Loading spinner -->
  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
        <p class="text-sm text-gray-500">{progress || 'Processing...'}</p>
      </div>
    </div>
  {/if}
</div>

<!-- Result -->
{#if transaction && !loading}
  <TransactionViewer {transaction} />
{/if}
