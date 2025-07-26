<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { session } from '$lib/stores/session.js';
  import { browser } from '$app/environment';
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/forgot-password',
    '/register'
  ];
  
  // Define protected routes that require authentication
  const protectedRoutes = [
    '/Gatepass',
    '/dashboard',
    '/admin'
  ];
  
  // Subscribe to stores
  let currentPath = $derived($page.url.pathname);
  let sessionData = $derived($session);
  let isAuthenticated = $derived(sessionData.isAuthenticated);
  let isLoading = $derived(sessionData.isLoading);
  
  // Check if current route is protected
  let isProtectedRoute = $derived(protectedRoutes.some(route => 
    currentPath.startsWith(route)
  ));
  
  // Check if current route is public
  let isPublicRoute = $derived(publicRoutes.some(route => 
    currentPath === route || currentPath.startsWith(route + '/')
  ));
  
  // Handle navigation protection
  $effect(() => {
    if (browser && !isLoading) {
      // If it's a protected route and user is not authenticated
      if (isProtectedRoute && !isAuthenticated) {
        // Redirect to login with return URL
        goto(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }
      
      // If it's a public route (like login) and user is authenticated
      if (isPublicRoute && currentPath === '/login' && isAuthenticated) {
        // Redirect to appropriate dashboard
        const user = session.getUser();
        let redirectPath = '/dashboard';
        
        if (user?.role === 'clerk') {
          redirectPath = '/Gatepass';
        }
        
        goto(redirectPath);
        return;
      }
    }
  });
</script>

<!-- This component doesn't render anything, it just handles navigation logic --> 