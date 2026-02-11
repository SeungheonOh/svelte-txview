<script lang="ts">
  import type { TxInfo } from '$lib/types/cardano';
  import { truncateHash, formatADA, formatWitness, formatSigner, getWitnessValue, getSignerValue } from '$lib/utils/format';
  import TxOutCard from './TxOutCard.svelte';
  import TxInInfoCard from './TxInInfoCard.svelte';
  import MintSection from './MintSection.svelte';
  import CertificatesSection from './CertificatesSection.svelte';
  import WithdrawalsSection from './WithdrawalsSection.svelte';
  import MetadataViewer from './MetadataViewer.svelte';
  import RedeemersSection from './RedeemersSection.svelte';
  import CollateralSection from './CollateralSection.svelte';
  import { fade, scale } from 'svelte/transition';

  let {
    transaction,
    isModal = false,
    onClose
  }: {
    transaction: TxInfo;
    isModal?: boolean;
    onClose?: () => void;
  } = $props();

  let showRaw = $state(false);
  let copiedHash = $state(false);
  let isClosing = $state(false);

  async function copyHash() {
    await navigator.clipboard.writeText(transaction.txHash);
    copiedHash = true;
    setTimeout(() => copiedHash = false, 2000);
  }

  const totalInput = $derived(
    transaction.txInInfos.reduce((sum, input) => sum + Number(input.value.coins), 0)
  );

  const totalOutput = $derived(
    transaction.txOuts.reduce((sum, output) => sum + Number(output.value.coins), 0)
  );

  const hasMint = $derived(transaction.mint && transaction.mint.length > 0);
  const hasCerts = $derived(transaction.certificates && transaction.certificates.length > 0);
  const hasWithdrawals = $derived(transaction.withdrawals && transaction.withdrawals.length > 0);
  const hasCollaterals = $derived(transaction.collaterals && transaction.collaterals.length > 0);
  const hasRedeemers = $derived(transaction.redeemers && transaction.redeemers.length > 0);
  const hasMetadata = $derived(transaction.metadata && Object.keys(transaction.metadata).length > 0);

  function hasSignerSigned(signer: string | { value: string }): boolean {
    const signerValue = getSignerValue(signer);
    return transaction.witnesses.some(witness => {
      const witnessValue = getWitnessValue(witness);
      return witnessValue.toLowerCase().includes(signerValue.toLowerCase());
    });
  }

  function closeModal() {
    isClosing = true;
    setTimeout(() => {
      onClose?.();
      isClosing = false;
    }, 150);
  }

  function handleBackdropClick(e: MouseEvent) {
    if (isModal && e.target === e.currentTarget) {
      closeModal();
    }
  }

  function handleEscapeKey(e: KeyboardEvent) {
    if (isModal && e.key === 'Escape') {
      closeModal();
    }
  }
</script>

{#snippet txContent()}
  <!-- Header Card -->
  <div class="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-3">
        <div>
          <h1 class="text-3xl font-bold text-black mb-2">Transaction Details</h1>
          <p class="text-sm text-gray-600">Complete transaction information</p>
        </div>
        {#if transaction.isValid !== undefined}
          {#if transaction.isValid}
            <span class="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Valid</span>
          {:else}
            <span class="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Invalid Script</span>
          {/if}
        {/if}
      </div>
      <button
        onclick={() => showRaw = !showRaw}
        class="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
      >
        {showRaw ? 'Hide' : 'Show'} Raw Data
      </button>
    </div>

    <!-- Transaction Hash -->
    <div class="bg-gray-50 rounded-md p-4 mb-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Transaction Hash</p>
          <button
            onclick={copyHash}
            class="group flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <span class="font-mono text-sm md:text-base font-medium text-black">
              {truncateHash(transaction.txHash, 20, 20)}
            </span>
            {#if copiedHash}
              <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <div class="border border-gray-200 rounded-md p-3">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          <span class="text-xs font-medium text-gray-600 uppercase">Total Input</span>
        </div>
        <p class="text-lg font-semibold text-black">{formatADA(BigInt(totalInput))} &#x20B3;</p>
      </div>

      <div class="border border-gray-200 rounded-md p-3">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
          <span class="text-xs font-medium text-gray-600 uppercase">Total Output</span>
        </div>
        <p class="text-lg font-semibold text-black">{formatADA(BigInt(totalOutput))} &#x20B3;</p>
      </div>

      <div class="border border-gray-200 rounded-md p-3">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
          <span class="text-xs font-medium text-gray-600 uppercase">Fee</span>
        </div>
        <p class="text-lg font-semibold text-black">{formatADA(BigInt(transaction.fee))} &#x20B3;</p>
      </div>

      {#if transaction.validityIntervalStart}
        <div class="border border-gray-200 rounded-md p-3">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
            <span class="text-xs font-medium text-gray-600 uppercase">Valid From</span>
          </div>
          <p class="text-lg font-semibold text-black">{transaction.validityIntervalStart}</p>
        </div>
      {/if}

      {#if transaction.ttl}
        <div class="border border-gray-200 rounded-md p-3">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
            <span class="text-xs font-medium text-gray-600 uppercase">TTL</span>
          </div>
          <p class="text-lg font-semibold text-black">{transaction.ttl}</p>
        </div>
      {/if}

      <div class="border border-gray-200 rounded-md p-3">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
          <span class="text-xs font-medium text-gray-600 uppercase">Inputs/Outputs</span>
        </div>
        <p class="text-lg font-semibold text-black">{transaction.txInInfos.length}/{transaction.txOuts.length}</p>
      </div>

      {#if transaction.scriptIntegrityHash}
        <div class="border border-gray-200 rounded-md p-3">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
            <span class="text-xs font-medium text-gray-600 uppercase">Script Hash</span>
          </div>
          <p class="text-sm font-mono text-black truncate" title={transaction.scriptIntegrityHash}>
            {truncateHash(transaction.scriptIntegrityHash, 8, 6)}
          </p>
        </div>
      {/if}

      {#if transaction.networkId !== undefined}
        <div class="border border-gray-200 rounded-md p-3">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
            <span class="text-xs font-medium text-gray-600 uppercase">Network</span>
          </div>
          <p class="text-lg font-semibold text-black">{transaction.networkId === 1 ? 'Mainnet' : 'Testnet'}</p>
        </div>
      {/if}
    </div>

    {#if showRaw}
      <div class="mt-6 bg-black text-white rounded-md p-4 overflow-hidden">
        <p class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Raw Transaction Data</p>
        <pre class="text-xs text-gray-300 overflow-x-auto font-mono break-all whitespace-pre-wrap">{transaction.txRaw}</pre>
      </div>
    {/if}
  </div>

  <!-- Required Signers Section -->
  {#if transaction.signers.length > 0}
    {@const signedCount = transaction.signers.filter(s => hasSignerSigned(s)).length}
    <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-black">Required Signers</h2>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
            {signedCount} signed
          </span>
          <span class="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            {transaction.signers.length} total
          </span>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-2">
        {#each transaction.signers as signer, i}
          {@const formatted = formatSigner(signer, 20)}
          {@const hasSigned = hasSignerSigned(signer)}
          <div class="rounded p-3 border transition-colors"
               class:bg-green-50={hasSigned}
               class:border-green-200={hasSigned}
               class:bg-gray-50={!hasSigned}
               class:border-gray-200={!hasSigned}>
            <div class="flex items-start justify-between">
              <div class="flex-1">
                {#if formatted.alias}
                  <p class="text-sm font-medium mb-1"
                     class:text-green-900={hasSigned}
                     class:text-gray-900={!hasSigned}>
                    {formatted.alias}
                  </p>
                  <p class="font-mono text-[10px] break-all"
                     class:text-green-600={hasSigned}
                     class:text-gray-500={!hasSigned}>
                    {formatted.signer}
                  </p>
                {:else}
                  <p class="font-mono text-xs break-all"
                     class:text-green-700={hasSigned}
                     class:text-gray-700={!hasSigned}>
                    {formatted.signer}
                  </p>
                {/if}
              </div>
              <div class="ml-2 flex-shrink-0">
                {#if hasSigned}
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span class="text-[10px] text-green-600 font-medium">Signed</span>
                  </div>
                {:else}
                  <div class="flex items-center gap-1">
                    <div class="w-4 h-4 border-2 border-gray-300 rounded"></div>
                    <span class="text-[10px] text-gray-500 font-medium">Pending</span>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Main Content Grid: Inputs + Outputs -->
  <div class="grid lg:grid-cols-2 gap-6">
    <!-- Inputs Section -->
    <div class="space-y-4">
      <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-black">Inputs</h2>
          <span class="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            {transaction.txInInfos.length}
          </span>
        </div>
        <div class="space-y-2">
          {#each transaction.txInInfos as input, i}
            <TxInInfoCard txInInfo={input} index={i} />
          {/each}
        </div>
      </div>

      {#if transaction.txRefInInfos.length > 0}
        <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-black">Reference Inputs</h2>
            <span class="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
              {transaction.txRefInInfos.length}
            </span>
          </div>
          <div class="space-y-2">
            {#each transaction.txRefInInfos as refInput, i}
              <TxInInfoCard txInInfo={refInput} index={i} isReference={true} />
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Outputs Section -->
    <div class="space-y-4">
      <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-black">Outputs</h2>
          <span class="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            {transaction.txOuts.length}
          </span>
        </div>
        <div class="space-y-2">
          {#each transaction.txOuts as output, i}
            <TxOutCard txOut={output} index={i} />
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Additional Sections -->
  {#if hasMint}
    <MintSection entries={transaction.mint!} />
  {/if}

  {#if hasCerts}
    <CertificatesSection certificates={transaction.certificates!} />
  {/if}

  {#if hasWithdrawals}
    <WithdrawalsSection withdrawals={transaction.withdrawals!} />
  {/if}

  {#if hasCollaterals}
    <CollateralSection
      collaterals={transaction.collaterals!}
      collateralReturn={transaction.collateralReturn}
      totalCollateral={transaction.totalCollateral}
    />
  {/if}

  {#if hasRedeemers}
    <RedeemersSection redeemers={transaction.redeemers!} />
  {/if}

  {#if hasMetadata}
    <MetadataViewer metadata={transaction.metadata!} />
  {/if}
{/snippet}

{#if isModal}
  <div
    class="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-backdrop"
    class:closing={isClosing}
    onclick={handleBackdropClick}
    onkeydown={handleEscapeKey}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div
      class="bg-white rounded-xl max-w-7xl w-full max-h-[90vh] relative shadow-2xl modal-content flex flex-col"
      class:closing={isClosing}
    >
      <button
        onclick={closeModal}
        class="absolute top-4 right-4 z-50 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-md"
        aria-label="Close modal"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div class="p-4 md:p-8 overflow-auto flex-1 scrollbar-hide">
        <div class="max-w-7xl mx-auto space-y-6">
          {@render txContent()}
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-white p-4 md:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      {@render txContent()}
    </div>
  </div>
{/if}

<style>
  @keyframes modalFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes modalSlideIn {
    from {
      transform: scale(0.95) translateY(10px);
      opacity: 0;
    }
    to {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }

  @keyframes modalFadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes modalSlideOut {
    from {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
    to {
      transform: scale(0.95) translateY(10px);
      opacity: 0;
    }
  }

  .modal-backdrop {
    animation: modalFadeIn 0.2s ease-out;
  }

  .modal-backdrop.closing {
    animation: modalFadeOut 0.15s ease-out forwards;
  }

  .modal-content {
    animation: modalSlideIn 0.25s ease-out;
  }

  .modal-content.closing {
    animation: modalSlideOut 0.15s ease-out forwards;
  }

  /* Hide scrollbar for Chrome, Safari and Opera */
  :global(.scrollbar-hide::-webkit-scrollbar) {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  :global(.scrollbar-hide) {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
</style>
