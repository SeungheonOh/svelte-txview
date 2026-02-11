<script lang="ts">
  import type { DatumFormatter } from '$lib/types/cardano';
  import { slide } from 'svelte/transition';

  let {
    datum,
    datumHash,
    isInline = false,
    formatter
  }: {
    datum?: any;
    datumHash?: string;
    isInline?: boolean;
    formatter?: DatumFormatter;
  } = $props();

  let expanded = $state(false);
  let copied = $state(false);

  const hasDatum = $derived(datum || datumHash);
  
  const formattedDatum = $derived(() => {
    if (!datum) return null;
    
    if (formatter) {
      try {
        return formatter(datum);
      } catch (e) {
        console.error('Datum formatter error:', e);
      }
    }
    
    return {
      label: 'Datum',
      formatted: datum
    };
  });

  function toggleExpanded() {
    if (hasDatum) {
      expanded = !expanded;
    }
  }

  async function copyDatum() {
    if (datum) {
      await navigator.clipboard.writeText(JSON.stringify(datum, null, 2));
      copied = true;
      setTimeout(() => copied = false, 2000);
    }
  }

  function formatJson(obj: any, indent = 0): string {
    if (typeof obj === 'string') return obj;
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  }
</script>

{#if hasDatum}
  <div class="datum-container">
    <button
      onclick={toggleExpanded}
      class="datum-toggle"
      class:has-content={datum}
      aria-expanded={expanded}
      aria-label={expanded ? 'Hide datum' : 'Show datum'}
    >
      <div class="datum-indicator">
        <div class="datum-dot" class:inline={isInline}></div>
        <span class="datum-label">
          {#if datum && formatter}
            {@const result = formattedDatum()}
            {result?.label || 'Datum'}
          {:else if isInline}
            Inline Datum
          {:else if datumHash}
            Datum Hash
          {:else}
            Datum
          {/if}
        </span>
      </div>
      <svg 
        class="chevron" 
        class:expanded
        width="12" 
        height="12" 
        viewBox="0 0 12 12" 
        fill="none"
      >
        <path 
          d="M3 4.5L6 7.5L9 4.5" 
          stroke="currentColor" 
          stroke-width="1.5" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
      </svg>
    </button>

    {#if expanded}
      <div class="datum-content" transition:slide={{ duration: 200 }}>
        {#if datumHash}
          <div class="datum-hash">
            <span class="hash-label">Hash</span>
            <span class="hash-value">{datumHash}</span>
          </div>
        {/if}
        {#if datum}
          <div class="datum-data" class:has-hash={datumHash}>
            {#if formatter}
              {@const result = formattedDatum()}
              {#if result && typeof result.formatted === 'string'}
                <pre class="formatted-text">{result.formatted}</pre>
              {:else if result}
                <pre class="formatted-json">{formatJson(result.formatted)}</pre>
              {/if}
            {:else}
              <pre class="raw-json">{formatJson(datum)}</pre>
            {/if}
            <button
              onclick={copyDatum}
              class="copy-btn"
              aria-label="Copy datum"
            >
              {#if copied}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              {:else}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              {/if}
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .datum-container {
    margin-top: 0.5rem;
    border-top: 1px solid #f3f4f6;
    padding-top: 0.5rem;
  }

  .datum-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.25rem 0.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background-color 0.15s;
    border-radius: 0.25rem;
  }

  .datum-toggle:hover {
    background-color: #f9fafb;
  }

  .datum-toggle.has-content {
    cursor: pointer;
  }

  .datum-indicator {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .datum-dot {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    background-color: #a855f7;
    flex-shrink: 0;
  }

  .datum-dot.inline {
    background-color: #8b5cf6;
  }

  .datum-label {
    font-size: 0.6875rem;
    color: #6b7280;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .chevron {
    color: #9ca3af;
    transition: transform 0.2s;
  }

  .chevron.expanded {
    transform: rotate(180deg);
  }

  .datum-content {
    margin-top: 0.5rem;
    padding: 0.75rem;
    background-color: #f9fafb;
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
  }

  .datum-hash {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
  }

  .hash-label {
    color: #6b7280;
    font-weight: 500;
  }

  .hash-value {
    font-family: monospace;
    color: #374151;
    word-break: break-all;
  }

  .datum-data {
    position: relative;
  }

  .datum-data.has-hash {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e5e7eb;
  }

  .copy-btn {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    padding: 0.25rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.25rem;
    cursor: pointer;
    color: #6b7280;
    transition: all 0.15s;
  }

  .copy-btn:hover {
    background-color: #f3f4f6;
    color: #374151;
  }

  pre {
    margin: 0;
    padding: 0;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    font-size: 0.6875rem;
    line-height: 1.4;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .formatted-text,
  .formatted-json,
  .raw-json {
    color: #1f2937;
    max-height: 300px;
    overflow-y: auto;
    padding-right: 2rem;
  }

  .raw-json {
    color: #4b5563;
  }

  /* Custom scrollbar for datum content */
  .datum-data pre::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .datum-data pre::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 3px;
  }

  .datum-data pre::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }

  .datum-data pre::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
</style>