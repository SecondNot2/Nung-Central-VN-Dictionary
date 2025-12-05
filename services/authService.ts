/**
 * Authentication Service
 * Handles all Supabase authentication operations
 */

import { supabase, isSupabaseConfigured } from "./supabaseClient";
import type {
  User as SupabaseUser,
  Session,
  AuthError,
} from "@supabase/supabase-js";

// User profile type matching database schema
export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  role: "contributor" | "admin";
  created_at: string;
  updated_at: string;
}

// Auth result types
export interface AuthResult {
  success: boolean;
  user?: SupabaseUser;
  profile?: UserProfile;
  error?: string;
}

// Local storage key for offline/fallback mode
const LOCAL_AUTH_KEY = "auth_user";

// Timeout wrapper for async operations
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  errorMessage: string = "Request timeout"
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (err) {
    clearTimeout(timeoutId!);
    throw err;
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Hệ thống chưa được cấu hình. Vui lòng liên hệ quản trị viên.",
    };
  }

  try {
    const { data, error } = await withTimeout(
      supabase.auth.signInWithPassword({ email, password }),
      15000,
      "Đăng nhập timeout. Vui lòng thử lại."
    );

    if (error) {
      return { success: false, error: getErrorMessage(error) };
    }

    if (data.user) {
      // Fetch user profile with timeout
      const profile = await withTimeout(
        getUserProfile(data.user.id),
        10000,
        "Lỗi tải hồ sơ"
      );
      return { success: true, user: data.user, profile: profile || undefined };
    }

    return { success: false, error: "Không thể đăng nhập" };
  } catch (err) {
    console.error("Sign in error:", err);
    const errorMsg =
      err instanceof Error ? err.message : "Lỗi kết nối. Vui lòng thử lại.";
    return { success: false, error: errorMsg };
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  displayName?: string
): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Hệ thống chưa được cấu hình. Vui lòng liên hệ quản trị viên.",
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Skip email confirmation - user can verify later in profile settings
        emailRedirectTo: undefined,
        data: {
          display_name: displayName || email.split("@")[0],
        },
      },
    });

    console.log("SignUp response:", {
      user: data.user?.id,
      session: data.session?.access_token ? "exists" : "null",
      error,
    });

    if (error) {
      return { success: false, error: getErrorMessage(error) };
    }

    // Check if email confirmation is still required
    if (data.user && !data.session) {
      console.warn("Email confirmation required - session is null");
      return {
        success: false,
        error:
          "Vui lòng kiểm tra email để xác thực tài khoản. Nếu không nhận được email, vui lòng liên hệ quản trị viên.",
      };
    }

    if (data.user && data.session) {
      // Create user profile in database
      const profile = await createUserProfile(data.user.id, email, displayName);

      if (!profile) {
        console.error("Failed to create user profile");
        return {
          success: false,
          error:
            "Tạo tài khoản thành công nhưng không thể tạo hồ sơ. Vui lòng thử đăng nhập.",
        };
      }

      return { success: true, user: data.user, profile };
    }

    return { success: false, error: "Không thể đăng ký" };
  } catch (err) {
    console.error("Sign up error:", err);
    return { success: false, error: "Lỗi kết nối. Vui lòng thử lại." };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  // Clear local storage
  localStorage.removeItem(LOCAL_AUTH_KEY);

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: getErrorMessage(error) };
    }
    return { success: true };
  } catch (err) {
    console.error("Sign out error:", err);
    return { success: false, error: "Lỗi đăng xuất" };
  }
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<Session | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch {
    return null;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<SupabaseUser | null> {
  if (!isSupabaseConfigured()) {
    // Check local storage for mock user
    const stored = localStorage.getItem(LOCAL_AUTH_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  try {
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

/**
 * Get user profile from database
 */
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data as UserProfile;
  } catch {
    return null;
  }
}

/**
 * Create user profile in database
 */
async function createUserProfile(
  userId: string,
  email: string,
  displayName?: string
): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .insert({
        id: userId,
        email,
        display_name: displayName || email.split("@")[0],
        role: "contributor",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      return null;
    }

    return data as UserProfile;
  } catch {
    return null;
  }
}

/**
 * Create profile for OAuth users (exported for use in App.tsx)
 * Uses upsert to avoid conflicts if profile already exists
 */
export async function createProfileForOAuthUser(
  userId: string,
  email: string,
  displayName?: string
): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          id: userId,
          email,
          display_name: displayName || email.split("@")[0],
          role: "contributor",
        },
        { onConflict: "id", ignoreDuplicates: true }
      )
      .select()
      .single();

    if (error) {
      // Ignore duplicate key errors (profile already exists)
      if (error.code === "23505") {
        console.log("Profile already exists for user:", userId);
        return null;
      }
      console.error("Error creating OAuth profile:", error);
      return null;
    }

    console.log("Created profile for OAuth user:", userId);
    return data as UserProfile;
  } catch (err) {
    console.error("Error in createProfileForOAuthUser:", err);
    return null;
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (user: SupabaseUser | null, profile: UserProfile | null) => void
) {
  if (!isSupabaseConfigured()) {
    // For mock mode, just call callback with stored user
    const stored = localStorage.getItem(LOCAL_AUTH_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored);
        callback(user, null);
      } catch {
        callback(null, null);
      }
    }
    return { unsubscribe: () => {} };
  }

  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const profile = await getUserProfile(session.user.id);
      callback(session.user, profile);
    } else {
      callback(null, null);
    }
  });

  return { unsubscribe: () => data.subscription.unsubscribe() };
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase chưa được cấu hình" };
  }

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      return { success: false, error: getErrorMessage(error) };
    }

    return { success: true };
  } catch (err) {
    console.error("Google sign in error:", err);
    return { success: false, error: "Lỗi đăng nhập Google" };
  }
}

// ==================== Helper Functions ====================

/**
 * Convert Supabase error to Vietnamese message
 */
function getErrorMessage(error: AuthError): string {
  switch (error.message) {
    case "Invalid login credentials":
      return "Email hoặc mật khẩu không đúng";
    case "Email not confirmed":
      return "Vui lòng xác nhận email trước khi đăng nhập";
    case "User already registered":
      return "Email đã được đăng ký";
    case "Password should be at least 6 characters":
      return "Mật khẩu phải có ít nhất 6 ký tự";
    case "Signup requires a valid password":
      return "Mật khẩu không hợp lệ";
    default:
      return error.message || "Đã xảy ra lỗi";
  }
}
