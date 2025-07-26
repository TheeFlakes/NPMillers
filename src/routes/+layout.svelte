<script>
	import '../app.css';
	import NavigationGuard from '$lib/components/NavigationGuard.svelte';
	
	let { children } = $props();
</script>

<NavigationGuard />
{@render children()}
