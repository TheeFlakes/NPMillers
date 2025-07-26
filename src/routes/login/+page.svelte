<!-- src/routes/login/+page.svelte -->
<script>
    import { goto } from '$app/navigation';
    import { session } from '$lib/stores/session.js';
    
    let email = '';
    let password = '';
    let rememberMe = false;
    let isLoading = false;
    let error = '';
    let success = '';
    
    async function handleLogin() {
        isLoading = true;
        error = '';
        success = '';
        
        try {
            // Use the session store to login
            const result = await session.login(email, password, rememberMe);
            
            if (result.success) {
                // Determine redirect based on user role
                let redirectPath = '/dashboard';
                if (result.user?.role === 'clerk') {
                    redirectPath = '/Gatepass';
                    success = '🛂 Login successful! Welcome, Clerk. Redirecting you to the Gatepass...';
                } else {
                    success = '🎉 Login successful! Welcome back, superstar! Redirecting you to your dashboard...';
                }
                // Redirect to the appropriate page after a short delay
                setTimeout(() => goto(redirectPath), 1200);
            } else {
                throw result.error;
            }
        } catch (err) {
            console.error('Login failed:', err);
            if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'code' in err.response && err.response.code === 400) {
                error = '😕 Oops! Incorrect email or password. Please double-check and try again.';
            } else if (err && typeof err === 'object' && 'status' in err && err.status === 400) {
                error = '😕 Oops! Incorrect email or password. Please double-check and try again.';
            } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string' && err.message.includes('Network')) {
                error = '🌐 Network error! Please check your internet connection and try again.';
            } else {
                error = '🚨 Something went wrong. Please try again later or contact support.';
            }
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="min-h-screen bg-white flex items-center justify-center p-4 sm:p-8">
    <div class="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8">
        <div class="w-full max-w-md bg-gray-50 rounded-lg shadow-md p-6 sm:p-8 space-y-6">
            <div class="text-center">
                <h1 class="text-3xl font-bold text-gray-900">New Paleah Millers</h1>
                <h2 class="mt-2 text-xl font-semibold text-gray-700">Welcome back</h2>
                <p class="mt-1 text-gray-500">
                    Start your website in seconds.
                </p>
            </div>

            {#if success}
                <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <span class="block sm:inline">{success}</span>
                </div>
            {/if}
            {#if error}
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span class="block sm:inline">{error}</span>
                </div>
            {/if}

            <form class="mt-4 space-y-4" on:submit|preventDefault={handleLogin}>
                <div class="space-y-4">
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            id="email"
                            type="email"
                            bind:value={email}
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="name@company.com"
                            required
                        />
                    </div>
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            id="password"
                            type="password"
                            bind:value={password}
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <input
                            id="remember-me"
                            type="checkbox"
                            bind:checked={rememberMe}
                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label for="remember-me" class="ml-2 block text-sm text-gray-700">Remember me</label>
                    </div>
                    <div class="text-sm">
                        <a href="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">
                            Forgot password?
                        </a>
                    </div>
                </div>

                <div class="space-y-3">
                    <button
                        type="submit"
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {#if isLoading}
                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                        {:else}
                            Sign in to your account
                        {/if}
                    </button>
                </div>
            </form>
        </div>
        <div class="hidden md:flex flex-1 items-center justify-center">
            <img src="/NPMlogo.png" alt="New Paleah Millers Logo" class="max-w-xs w-full h-auto object-contain" />
        </div>
    </div>
</div>