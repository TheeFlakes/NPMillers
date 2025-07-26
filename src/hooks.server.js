import { pb } from '$lib/stores/session.js';

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

export async function handle({ event, resolve }) {
  const { url } = event;
  const pathname = url.pathname;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // If it's a protected route, check authentication
  if (isProtectedRoute) {
    // Get the auth cookie
    const authCookie = event.cookies.get('pb_auth');
    
    if (authCookie) {
      try {
        // Load auth data from cookie
        pb.authStore.loadFromCookie(authCookie);
        
        // Check if the auth is valid
        if (!pb.authStore.isValid) {
          // Invalid auth, redirect to login
          return Response.redirect(`${url.origin}/login?redirect=${encodeURIComponent(pathname)}`, 302);
        }
        
        // Valid auth, continue with the request
        event.locals.user = pb.authStore.model;
        event.locals.pb = pb;
      } catch (error) {
        console.error('Auth validation error:', error);
        // Error validating auth, redirect to login
        return Response.redirect(`${url.origin}/login?redirect=${encodeURIComponent(pathname)}`, 302);
      }
    } else {
      // No auth cookie, redirect to login
      return Response.redirect(`${url.origin}/login?redirect=${encodeURIComponent(pathname)}`, 302);
    }
  }

  // If it's a public route and user is authenticated, redirect to dashboard
  if (isPublicRoute && pathname === '/login') {
    const authCookie = event.cookies.get('pb_auth');
    
    if (authCookie) {
      try {
        pb.authStore.loadFromCookie(authCookie);
        
        if (pb.authStore.isValid) {
          // User is already authenticated, redirect to appropriate dashboard
          const user = pb.authStore.model;
          let redirectPath = '/dashboard';
          
          if (user?.role === 'clerk') {
            redirectPath = '/Gatepass';
          }
          
          return Response.redirect(`${url.origin}${redirectPath}`, 302);
        }
      } catch (error) {
        console.error('Auth validation error:', error);
        // Continue to login page if there's an error
      }
    }
  }

  // Continue with the request
  const response = await resolve(event);
  return response;
} 