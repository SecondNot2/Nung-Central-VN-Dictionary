/**
 * Supabase Client Configuration
 * Initializes the Supabase client for database operations
 */

import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase credentials not found. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local"
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Store session in localStorage for faster access and persistence across tabs/reloads
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

// Helper to get access token robustly (fallback to localStorage)
export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;

  try {
    // 1. Try memory/session first (fastest)
    // We wrap in a short timeout to prevent hanging if client is stuck
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 500)
    );

    try {
      const { data } = (await Promise.race([
        supabase.auth.getSession(),
        timeoutPromise,
      ])) as any;
      if (data?.session?.access_token) {
        return data.session.access_token;
      }
    } catch (e) {
      // Ignore timeout/error, proceed to localStorage
    }

    // 2. Fallback to localStorage
    if (typeof localStorage !== "undefined") {
      const storageKey = Object.keys(localStorage).find(
        (key) => key.startsWith("sb-") && key.endsWith("-auth-token")
      );
      if (storageKey) {
        const item = localStorage.getItem(storageKey);
        if (item) {
          const parsed = JSON.parse(item);
          return parsed.access_token || null;
        }
      }
    }
  } catch (err) {
    console.warn("Error getting access token:", err);
  }
  return null;
}

export const isSupabaseConfigured = () => !!supabaseUrl && !!supabaseAnonKey;
