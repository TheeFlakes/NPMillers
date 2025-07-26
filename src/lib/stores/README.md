# Authentication System

This application uses a comprehensive authentication system with both server-side and client-side route protection.

## Components

### 1. Session Store (`session.js`)
- Manages authentication state using Svelte stores
- Handles login/logout operations
- Stores user data and authentication status
- Manages both localStorage and cookies for persistence

### 2. Server Hook (`hooks.server.js`)
- Provides server-side route protection
- Validates authentication before routes are rendered
- Handles redirects for unauthenticated users
- Prevents authenticated users from accessing login page

### 3. Navigation Guard (`NavigationGuard.svelte`)
- Provides client-side route protection
- Monitors route changes and authentication state
- Handles client-side redirects
- Works alongside server hooks for comprehensive protection

### 4. Auth Guard (`AuthGuard.svelte`)
- Component-level protection for specific routes
- Shows loading states during authentication checks
- Renders protected content only when authenticated

## Route Protection

### Protected Routes
- `/Gatepass/*` - All Gatepass-related routes
- `/dashboard` - Main dashboard
- `/admin` - Admin panel

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/forgot-password` - Password recovery
- `/register` - User registration

## How It Works

1. **Server-Side Protection**: The `hooks.server.js` file intercepts all requests and checks authentication before rendering routes.

2. **Client-Side Protection**: The `NavigationGuard.svelte` component monitors route changes and ensures users can't navigate to protected routes without authentication.

3. **Component-Level Protection**: The `AuthGuard.svelte` component provides additional protection for specific components.

4. **Authentication Flow**:
   - User attempts to access protected route
   - Server hook checks authentication
   - If not authenticated, redirects to login with return URL
   - After successful login, user is redirected to originally requested page

## Usage

The authentication system is automatically applied to all routes. No additional configuration is needed for basic protection.

For custom route protection, you can:
1. Add routes to the `protectedRoutes` array in both `hooks.server.js` and `NavigationGuard.svelte`
2. Use the `AuthGuard` component around specific content
3. Access user data via the session store: `import { session } from '$lib/stores/session.js'` 