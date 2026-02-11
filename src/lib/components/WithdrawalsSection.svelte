<script lang="ts">
  import type { Withdrawal } from '$lib/types/cardano';
  import { formatADA, truncateHash } from '$lib/utils/format';

  let { withdrawals }: { withdrawals: Withdrawal[] } = $props();

  const totalWithdrawn = $derived(
    withdrawals.reduce((sum, w) => sum + w.amount, 0n)
  );
</script>

<div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold text-black">Withdrawals</h2>
    <div class="flex items-center gap-2">
      <span class="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
        {withdrawals.length}
      </span>
      <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
        {formatADA(totalWithdrawn)} ADA
      </span>
    </div>
  </div>

  <div class="space-y-2">
    {#each withdrawals as withdrawal}
      <div class="border border-gray-200 rounded p-3 flex items-center justify-between">
        <div>
          <span class="text-xs text-gray-500">Stake Address</span>
          <p class="font-mono text-xs text-gray-700" title={withdrawal.stakeAddress}>
            {truncateHash(withdrawal.stakeAddress, 16, 8)}
          </p>
        </div>
        <span class="font-mono text-sm font-medium text-black">
          {formatADA(withdrawal.amount)} ADA
        </span>
      </div>
    {/each}
  </div>
</div>
