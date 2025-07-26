import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import PocketBase from 'pocketbase';

// Create PocketBase instance
export const pb = new PocketBase('https://odds.pockethost.io');

// Create the session store
function createSessionStore() {
    const { subscribe, set, update } = writable({
        user: null,
        isAuthenticated: false,
        isLoading: true
    });

    // Initialize session from localStorage if available
    if (browser) {
        const savedAuth = localStorage.getItem('pocketbase_auth');
        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                pb.authStore.loadFromCookie(authData);
                
                if (pb.authStore.isValid) {
                    set({
                        user: pb.authStore.model,
                        isAuthenticated: true,
                        isLoading: false
                    });
                } else {
                    // Clear invalid auth data
                    localStorage.removeItem('pocketbase_auth');
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false
                    });
                }
            } catch (error) {
                console.error('Error loading saved auth:', error);
                localStorage.removeItem('pocketbase_auth');
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false
                });
            }
        } else {
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false
            });
        }
    }

    return {
        subscribe,
        
        // Login function
        async login(email, password, rememberMe = false) {
            try {
                const authData = await pb.collection('users').authWithPassword(email, password);
                
                if (rememberMe) {
                    localStorage.setItem('pocketbase_auth', JSON.stringify(pb.authStore.exportToCookie()));
                }
                
                // Set cookie for server-side authentication
                if (browser) {
                    document.cookie = `pb_auth=${pb.authStore.exportToCookie()}; path=/; max-age=${rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60}; SameSite=Strict`;
                }
                
                set({
                    user: authData.record,
                    isAuthenticated: true,
                    isLoading: false
                });
                
                return { success: true, user: authData.record };
            } catch (error) {
                console.error('Login error:', error);
                return { success: false, error };
            }
        },
        
        // Logout function
        async logout() {
            try {
                pb.authStore.clear();
                localStorage.removeItem('pocketbase_auth');
                
                // Clear cookie for server-side authentication
                if (browser) {
                    document.cookie = 'pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
                }
                
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false
                });
                
                return { success: true };
            } catch (error) {
                console.error('Logout error:', error);
                return { success: false, error };
            }
        },
        
        // Check if user is authenticated
        isAuthenticated() {
            return pb.authStore.isValid;
        },
        
        // Get current user
        getUser() {
            return pb.authStore.model;
        },
        
        // Update user data
        updateUser(userData) {
            update(state => ({
                ...state,
                user: userData
            }));
        }
    };
}

export const session = createSessionStore(); 