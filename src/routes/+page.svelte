<script lang="ts">
  import TransactionViewer from '$lib/components/TransactionViewer.svelte';
  import type { TxInfo } from '$lib/types/cardano';

  let showModal = $state(false);
  let showInline = $state(false);

  // Sample transaction data with more realistic values
  const sampleTransaction: TxInfo = {
    txHash: '4e3a6e7fdcb0d0efa17bf79c13aed2b4cb9baf37fb1aa2e39553d5bd720c5c99fe2a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
    txRaw: 'a300818258204e3a6e7fdcb0d0efa17bf79c13aed2b4cb9baf37fb1aa2e39553d5bd720c5c990001818258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1a006ca79302182a030aa100828258206199186adb51974690d7247d2646097d2c62763b767b528816fb7ed5f9e6328258407f2d8d351ef5c3b6e0a4e1b1f9e39b56a4d36a8c1e394e0b24f1d0e7b3a5c6f8f1a2e3c4e5b6d7a8e9f0c1d2e3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3825820e1f0a9b6c8d2e4b7a3f5c9d0e2a1b4c7d8e9f0a2b3c4d5e6f7a8b9c0d1e2f3a458401234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdeff6',
    txOuts: [
      {
        address: {
          value: 'addr1qy2c8r6lxsjr0ky500rgn0d92w3g3rldlkzac9vkw7y3ysdzy7hwgns84hn3d2aquqvvmfpyntkcxz7wm5jx3hmdnxcq5j34e9',
          alias: 'Alice\'s Wallet'
        },
        value: {
          coins: 10000000n,
          assets: {
            '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7': 100n,
            '446f6c6c617220436f696e': 5000n,
            'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235484f534b59': 250n
          }
        },
        datum_inline: false
      },
      {
        address: {
          value: 'addr1q9xu2w7tghzch0kna8x3ft8e7dmsvs8mhz2fxfzhqkzezredzy7hwgns84hn3d2aquqvvmfpyntkcxz7wm5jx3hmdnxcs5ys5w',
          alias: 'Smart Contract'
        },
        address_script_hash: 'script1zqkx8g9tghnch0kna8x3ft8e7dmsvs8mhz2fx',
        value: {
          coins: 2000000n
        },
        datum_hash: '9e1199a988ba72ffd6e9c269cadb3b25b8cf2f90c2c4b28e12b91a192db8ae8b',
        datum_inline: true,
        datum: {
          constructor: 0,
          fields: [
            { bytes: "d87980" },
            { int: 1705504800000 },
            { 
              list: [
                { bytes: "4d494e53574150" },
                { int: 500000 }
              ]
            }
          ]
        },
        datumFormatter: (datum) => ({
          label: 'Swap Order',
          formatted: {
            type: 'LIMIT_ORDER',
            expiry: new Date(datum.fields[1].int).toISOString(),
            tokenPair: datum.fields[2].list[0].bytes,
            minAmount: datum.fields[2].list[1].int
          }
        })
      },
      {
        address: 'addr1qx5u7hgcs88d4w5dpvr7hqgayy3w2qkvqvgm6xhp7x3ykvdzy7hwgns84hn3d2aquqvvmfpyntkcxz7wm5jx3hmdnxcsgnxs8k',
        value: {
          coins: 3500000n,
          assets: {
            '8f9c32a8bc9d4e6f7a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b': 1000n
          }
        },
        datum_inline: false,
        datum_hash: 'a5b3f6e8c9d2a1b4c7d8e9f0a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
        datum: {
          constructor: 0,
          fields: [
            { bytes: "d87980" },
            { int: 1705504800000 },
            { 
              list: [
                { bytes: "4d494e53574150" },
                { int: 500000 }
              ]
            }
          ]
        }
        // Note: No datumFormatter provided - will show raw JSON
      }
    ],
    txInInfos: [
      {
        transaction_id: '7d7c9b2e08b8bfac4d7e704e9e23a1e8d88b92c45e2a2df5c8e0d7e41f9e6328',
        output_index: 0n,
        address: {
          value: 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x',
          alias: 'Exchange Hot Wallet'
        },
        value: {
          coins: 15000000n,
          assets: {
            '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7': 100n,
            '8f9c32a8bc9d4e6f7a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b': 1000n
          }
        },
        datum_inline: false,
	datum_hash: 'a5b3f6e8c9d2a1b4c7d8e9f0a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
        datum: {
          owner: 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x',
          beneficiary: 'addr1q9xu2w7tghzch0kna8x3ft8e7dmsvs8mhz2fxfzhqkzezredzy7hwgns84hn3d2aquqvvmfpyntkcxz7wm5jx3hmdnxcs5ys5w',
          unlockTime: 1705504800,
          amount: 15000000
        },
        datumFormatter: (datum) => ({
          label: 'Vesting Contract',
          formatted: `Owner: ${datum.owner.slice(0, 20)}...
Beneficiary: ${datum.beneficiary.slice(0, 20)}...
Unlock: ${new Date(datum.unlockTime * 1000).toLocaleDateString()}
Amount: ${(datum.amount / 1000000).toFixed(2)} ADA`
        })
      },
      {
        transaction_id: 'b2a4f6e8c1d3a5b7e9f0c2d4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4',
        output_index: 1n,
        address: {
          value: 'addr1q87ghr4lxsjr0ky500rgn0d92w3g3rldlkzac9vkw7y3ysdzy7hwgns84hn3d2aquqvvmfpyntkcxz7wm5jx3hmdnxcq5j34e9',
          alias: 'Bob\'s Wallet'
        },
        value: {
          coins: 1000000n,
          assets: {
            '446f6c6c617220436f696e': 5000n,
            'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235484f534b59': 250n
          }
        },
        datum_inline: false
      }
    ],
    txRefInInfos: [
      {
        transaction_id: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890',
        output_index: 2n,
        address: {
          value: 'addr1q8gg8r0jmhxtkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgs7xl6qe',
          alias: 'Oracle Feed'
        },
        value: {
          coins: 5000000n
        },
        datum_inline: false
      }
    ],
    signers: [
      {
        value: 'e1f0a9b6c8d2e4b7a3f5c9d0e2a1b4c7d8e9f0a2b3c4d5e6f7a8b9c0d1e2f3a4',
        alias: 'Alice\'s Key'
      },
      {
        value: 'b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0',
        alias: 'Bob\'s Key'
      },
      {
        value: 'c7d8e9f0a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9',
        alias: 'Charlie\'s Key'
      }
    ],
    witnesses: [
      // Alice's signature - contains her key hash
      '825820e1f0a9b6c8d2e4b7a3f5c9d0e2a1b4c7d8e9f0a2b3c4d5e6f7a8b9c0d1e2f3a458407f2d8d351ef5c3b6e0a4e1b1f9e39b56a4d36a8c1e394e0b24f1d0e7b3a5c6f8',
      // Bob's signature - contains his key hash  
      '825820b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c058401234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      // Note: Charlie hasn't signed yet
    ],
    validityIntervalStart: 87654321,
    ttl: 87655000,
    fee: 175000
  };
</script>

<svelte:head>
  <title>Cardano Transaction Viewer</title>
</svelte:head>

<!-- Minimalist Header -->
<div class="border-b border-gray-200 bg-white">
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-black">Cardano Transaction Viewer</h1>
        <p class="text-sm text-gray-600 mt-1">Minimalist transaction visualization</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="flex items-center gap-1.5 text-xs text-gray-600">
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Mainnet
        </span>
      </div>
    </div>
  </div>
</div>

<!-- Demo Controls -->
<div class="max-w-7xl mx-auto px-4 py-8">
  <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
    <h2 class="text-lg font-semibold text-black mb-4">Transaction Viewer Demo</h2>
    <div class="flex flex-col sm:flex-row gap-4">
      <button
        onclick={() => showModal = true}
        class="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
      >
        Open as Modal
      </button>
      <button
        onclick={() => showInline = !showInline}
        class="px-6 py-3 bg-white text-black border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
      >
        {showInline ? 'Hide' : 'Show'} Inline View
      </button>
    </div>
    <p class="text-sm text-gray-600 mt-4">
      The TransactionViewer component can be used both as a modal overlay or as an inline component.
    </p>
  </div>
</div>

<!-- Modal View -->
{#if showModal}
  <TransactionViewer 
    transaction={sampleTransaction} 
    isModal={true}
    onClose={() => showModal = false}
  />
{/if}

<!-- Inline View -->
{#if showInline}
  <TransactionViewer transaction={sampleTransaction} />
{/if}