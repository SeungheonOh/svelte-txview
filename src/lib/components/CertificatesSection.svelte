<script lang="ts">
  import type { Certificate } from '$lib/types/cardano';
  import { truncateHash } from '$lib/utils/format';

  let { certificates }: { certificates: Certificate[] } = $props();

  const typeColors: Record<string, string> = {
    StakeRegistration: 'bg-green-100 text-green-700',
    StakeDeregistration: 'bg-red-100 text-red-700',
    StakeDelegation: 'bg-blue-100 text-blue-700',
    PoolRegistration: 'bg-purple-100 text-purple-700',
    PoolRetirement: 'bg-orange-100 text-orange-700',
    VoteDelegation: 'bg-indigo-100 text-indigo-700'
  };

  function getTypeColor(type: string): string {
    return typeColors[type] || 'bg-gray-100 text-gray-700';
  }
</script>

<div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold text-black">Certificates</h2>
    <span class="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
      {certificates.length}
    </span>
  </div>

  <div class="space-y-2">
    {#each certificates as cert, i}
      <div class="border border-gray-200 rounded p-3">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs text-gray-500 font-mono">#{i}</span>
          <span class="px-2 py-0.5 rounded text-xs font-medium {getTypeColor(cert.type)}">
            {cert.type}
          </span>
        </div>
        {#if Object.keys(cert.detail).length > 0}
          <div class="pl-2 border-l border-gray-200 space-y-1">
            {#each Object.entries(cert.detail) as [key, value]}
              <div class="flex items-start gap-2 text-xs">
                <span class="text-gray-500 shrink-0">{key}:</span>
                <span class="font-mono text-gray-700 break-all">
                  {typeof value === 'object' ? JSON.stringify(value) : truncateHash(String(value), 16, 8)}
                </span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
