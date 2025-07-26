<!-- src/routes/+page.svelte -->
<script>
    import { goto } from '$app/navigation';

    function redirectToLogin() {
        goto('/login');
    }
</script>

<div class="min-h-screen bg-white flex flex-col items-center justify-center p-4 rounded-2xl max-w-xs mx-auto mt-8 md:mt-16">
    <img src="/NPMlogo.png" alt="NPM Logo" class="mb-0 max-w-[90%] h-auto rounded-full" />
    <button
        on:click={redirectToLogin}
        class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full max-w-[250px]"
    >
        Continue to Login
    </button>
</div>