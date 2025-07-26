<script>
  import { goto } from '$app/navigation';
  import { session } from '$lib/stores/session.js';
  import { browser } from '$app/environment';
  
  let { children } = $props();
  
  // Subscribe to session store
  let sessionData = $derived($session);
  let isAuthenticated = $derived(sessionData.isAuthenticated);
  let isLoading = $derived(sessionData.isLoading);
  
  // Redirect if not authenticated and not loading
  $effect(() => {
    if (browser && !isLoading && !isAuthenticated) {
      goto('/login');
    }
  });
</script>

{#if isLoading}
  <div class="min-h-screen flex items-center justify-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
{:else if isAuthenticated}
  {@render children()}
{/if} 