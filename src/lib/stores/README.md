# Session Store

This session store manages user authentication state throughout the application.

## Features

- **Centralized Authentication**: Single source of truth for user authentication state
- **Session Persistence**: Automatically saves and restores authentication from localStorage
- **TypeScript Support**: Full type safety for authentication data
- **Easy Integration**: Simple API for login, logout, and session checking

## Usage

### Import the session store

```javascript
import { session, pb } from '$lib/stores/session.js';
// or
import { session, pb } from '$lib/index.js';
```

### Login

```javascript
const result = await session.login(email, password, rememberMe);
if (result.success) {
  // User is now logged in
  console.log('Logged in user:', result.user);
} else {
  // Handle login error
  console.error('Login failed:', result.error);
}
```

### Logout

```javascript
const result = await session.logout();
if (result.success) {
  // User is now logged out
  // Redirect to login page
  goto('/login');
}
```

### Check Authentication Status

```javascript
// Check if user is currently authenticated
const isAuthenticated = session.isAuthenticated();

// Get current user data
const user = session.getUser();
```

### Subscribe to Session Changes

```javascript
import { session } from '$lib/stores/session.js';

// Subscribe to session changes
session.subscribe((sessionData) => {
  console.log('Session updated:', sessionData);
  // sessionData.user - current user object
  // sessionData.isAuthenticated - boolean
  // sessionData.isLoading - boolean
});
```

### Using in Svelte Components

```svelte
<script>
  import { session } from '$lib/stores/session.js';
  
  // Subscribe to session store
  $: user = $session.user;
  $: isAuthenticated = $session.isAuthenticated;
</script>

{#if isAuthenticated}
  <p>Welcome, {user.email}!</p>
{:else}
  <p>Please log in</p>
{/if}
```

## PocketBase Instance

The store also exports a centralized PocketBase instance that should be used throughout the application:

```javascript
import { pb } from '$lib/stores/session.js';

// Use the centralized PocketBase instance
const records = await pb.collection('your_collection').getList();
```

## Authentication Guard Component

Use the `AuthGuard` component to protect routes that require authentication:

```svelte
<script>
  import AuthGuard from '$lib/components/AuthGuard.svelte';
</script>

<AuthGuard>
  <!-- Your protected content here -->
  <h1>Protected Page</h1>
</AuthGuard>
```

## Session Persistence

The session store automatically:
- Saves authentication data to localStorage when "Remember Me" is checked
- Restores authentication on page reload
- Clears invalid authentication data
- Handles token expiration

## Error Handling

All session store methods return objects with a `success` boolean and optional `error` property:

```javascript
const result = await session.login(email, password);
if (!result.success) {
  // Handle error
  console.error('Authentication error:', result.error);
}
``` 