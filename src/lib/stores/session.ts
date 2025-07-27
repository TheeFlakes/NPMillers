import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import PocketBase from 'pocketbase';
import type { RecordModel } from 'pocketbase';

export const pb = new PocketBase('https://odds.pockethost.io');

type SessionState = {
  user: RecordModel | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

type SessionStore = Writable<SessionState> & {
  login(email: string, password: string, rememberMe?: boolean): Promise<{ success: boolean; user?: RecordModel; error?: any }>;
  logout(): Promise<{ success: boolean; error?: any }>;
  isAuthenticated(): boolean;
  getUser(): RecordModel | null;
  updateUser(userData: RecordModel): void;
};

function createSessionStore(): SessionStore {
  const { subscribe, set, update } = writable<SessionState>({
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
          document.cookie = `pb_auth=${pb.authStore.exportToCookie()}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Strict`;
        } else {
          localStorage.removeItem('pocketbase_auth');
          set({ user: null, isAuthenticated: false, isLoading: false });
          document.cookie = 'pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
        }
      } catch (error) {
        console.error('Error loading saved auth:', error);
        localStorage.removeItem('pocketbase_auth');
        set({ user: null, isAuthenticated: false, isLoading: false });
        document.cookie = 'pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
      }
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
      document.cookie = 'pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    }
  }

  return {
    subscribe,
    set,
    update,
    async login(email: string, password: string, rememberMe = false) {
      try {
        const authData = await pb.collection('users').authWithPassword(email, password);
        if (rememberMe) {
          localStorage.setItem('pocketbase_auth', JSON.stringify(pb.authStore.exportToCookie()));
        }
        if (browser) {
          document.cookie = `pb_auth=${pb.authStore.exportToCookie()}; path=/; max-age=${rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60}; SameSite=Strict`;
        }
        set({ user: authData.record, isAuthenticated: true, isLoading: false });
        return { success: true, user: authData.record };
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, error };
      }
    },
    async logout() {
      try {
        pb.authStore.clear();
        localStorage.removeItem('pocketbase_auth');
        if (browser) {
          document.cookie = 'pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
        }
        set({ user: null, isAuthenticated: false, isLoading: false });
        return { success: true };
      } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error };
      }
    },
    isAuthenticated() {
      return pb.authStore.isValid;
    },
    getUser() {
      return pb.authStore.model;
    },
    updateUser(userData: RecordModel) {
      update(state => ({ ...state, user: userData }));
    }
  };
}

export const session: SessionStore = createSessionStore(); 