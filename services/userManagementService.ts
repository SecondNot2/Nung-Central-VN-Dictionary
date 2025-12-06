/**
 * User Management Service
 * Handles user CRUD operations for admin and profile management
 */

import {
  supabase,
  isSupabaseConfigured,
  getAccessToken,
  supabaseUrl,
  supabaseAnonKey,
} from "./supabaseClient";
import type { UserProfile } from "./authService";

// Extended user profile with new fields
export interface ExtendedUserProfile extends UserProfile {
  avatar_url?: string;
  email_verified?: boolean;
}

// Stats for admin dashboard
export interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  totalContributors: number;
  recentSignups: number; // last 7 days
}

// Timeout wrapper for async operations
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  errorMessage: string = "Request timeout"
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

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

// ==================== Admin Functions ====================

/**
 * Get all users with pagination (admin only)
 */
export async function getAllUsers(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{ users: ExtendedUserProfile[]; total: number }> {
  if (!isSupabaseConfigured()) {
    return { users: [], total: 0 };
  }

  try {
    let query = supabase.from("user_profiles").select("*", { count: "exact" });

    // Add search filter
    if (search) {
      query = query.or(
        `email.ilike.%${search}%,display_name.ilike.%${search}%`
      );
    }

    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order("created_at", { ascending: false });

    // Use timeout for query
    const result = await withTimeout(
      Promise.resolve(query),
      8000,
      "Timeout fetching users"
    );
    const { data, error, count } = result as any;

    if (error) {
      console.error("Error fetching users:", error);
      return { users: [], total: 0 };
    }

    return {
      users: (data || []) as ExtendedUserProfile[],
      total: count || 0,
    };
  } catch (err) {
    console.error("Get all users error:", err);
    return { users: [], total: 0 };
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  userId: string,
  role: "contributor" | "admin"
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      console.error("Error updating role:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Update role error:", err);
    return { success: false, error: "Lỗi cập nhật quyền" };
  }
}

/**
 * Delete user (admin only) - removes from user_profiles, auth cascade handles rest
 */
export async function deleteUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    // Delete from auth.users (cascade will delete profile)
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error("Error deleting user:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Delete user error:", err);
    return { success: false, error: "Lỗi xóa người dùng" };
  }
}

/**
 * Get user statistics for dashboard
 */
export async function getStats(): Promise<UserStats> {
  if (!isSupabaseConfigured()) {
    return {
      totalUsers: 0,
      totalAdmins: 0,
      totalContributors: 0,
      recentSignups: 0,
    };
  }

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Use Promise.all with timeout to fetch all stats concurrently
    // Use Promise.resolve to handle Thenable PostgrestBuilder
    const [usersResult, adminsResult, recentResult] = (await withTimeout(
      Promise.all([
        Promise.resolve(
          supabase
            .from("user_profiles")
            .select("*", { count: "exact", head: true })
        ),
        Promise.resolve(
          supabase
            .from("user_profiles")
            .select("*", { count: "exact", head: true })
            .eq("role", "admin")
        ),
        Promise.resolve(
          supabase
            .from("user_profiles")
            .select("*", { count: "exact", head: true })
            .gte("created_at", sevenDaysAgo.toISOString())
        ),
      ]),
      10000,
      "Timeout fetching stats"
    )) as any[];

    const totalUsers = usersResult.count || 0;
    const totalAdmins = adminsResult.count || 0;
    const recentSignups = recentResult.count || 0;

    return {
      totalUsers: totalUsers,
      totalAdmins: totalAdmins,
      totalContributors: totalUsers - totalAdmins,
      recentSignups: recentSignups,
    };
  } catch (err) {
    console.error("Get stats error:", err);
    return {
      totalUsers: 0,
      totalAdmins: 0,
      totalContributors: 0,
      recentSignups: 0,
    };
  }
}

// ==================== User Profile Functions ====================

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  data: { display_name?: string; avatar_url?: string }
): Promise<{
  success: boolean;
  profile?: ExtendedUserProfile;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: error.message };
    }

    return { success: true, profile: profile as ExtendedUserProfile };
  } catch (err) {
    console.error("Update profile error:", err);
    return { success: false, error: "Lỗi cập nhật hồ sơ" };
  }
}

/**
 * Upload avatar to Supabase storage
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = fileName; // Store directly in bucket root

    console.log("Uploading avatar:", {
      fileName,
      size: file.size,
      type: file.type,
    });

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Upload error details:", uploadError);

      // Check for specific error types
      if (
        uploadError.message?.includes("bucket") ||
        uploadError.message?.includes("not found")
      ) {
        return {
          success: false,
          error:
            "Storage bucket chưa được tạo. Vui lòng tạo bucket 'avatars' trong Supabase.",
        };
      }
      if (
        uploadError.message?.includes("policy") ||
        uploadError.message?.includes("permission")
      ) {
        return {
          success: false,
          error: "Không có quyền upload. Vui lòng kiểm tra storage policies.",
        };
      }

      return { success: false, error: `Lỗi upload: ${uploadError.message}` };
    }

    console.log("Upload success:", uploadData);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const avatarUrl = urlData.publicUrl;
    console.log("Avatar URL:", avatarUrl);

    // Update profile with new avatar URL
    const updateResult = await updateProfile(userId, { avatar_url: avatarUrl });

    if (!updateResult.success) {
      return { success: false, error: updateResult.error };
    }

    return { success: true, url: avatarUrl };
  } catch (err) {
    console.error("Upload avatar error:", err);
    return { success: false, error: "Lỗi upload ảnh đại diện" };
  }
}

/**
 * Resend email verification
 */
export async function resendVerificationEmail(): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { success: false, error: "Không tìm thấy email" };
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    });

    if (error) {
      console.error("Resend verification error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Resend verification error:", err);
    return { success: false, error: "Lỗi gửi email xác thực" };
  }
}

/**
 * Change password
 * Uses direct Fetch API to avoid Supabase Client hanging issues
 */
export async function changePassword(
  newPassword: string
): Promise<{ success: boolean; error?: string; requiresRelogin?: boolean }> {
  if (!isSupabaseConfigured() || !supabaseUrl || !supabaseAnonKey) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    console.log("changePassword: Starting...");

    // Get access token
    let accessToken: string | null = null;

    // Try getting from Supabase client first
    const { data } = await supabase.auth.getSession();
    accessToken = data.session?.access_token || null;

    // Fallback to localStorage if client returns null/undefined
    if (!accessToken) {
      console.log(
        "changePassword: No session in client, checking localStorage"
      );
      try {
        const storageKey = Object.keys(localStorage).find(
          (key) => key.startsWith("sb-") && key.endsWith("-auth-token")
        );
        if (storageKey) {
          const sessionStr = localStorage.getItem(storageKey);
          if (sessionStr) {
            const sessionData = JSON.parse(sessionStr);
            accessToken = sessionData.access_token;
          }
        }
      } catch (e) {
        console.warn("Error reading localStorage for token", e);
      }
    }

    if (!accessToken) {
      console.error("changePassword: No access token found");
      return { success: false, error: "Phiên đăng nhập không hợp lệ" };
    }

    console.log("changePassword: Got token, calling API");

    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        password: newPassword,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Change password error:", result);
      return {
        success: false,
        error: result.msg || result.message || "Lỗi đổi mật khẩu",
      };
    }

    console.log("changePassword: Success");

    // Password changed successfully - session may be invalidated
    // Return flag indicating user should re-login for security
    return { success: true, requiresRelogin: true };
  } catch (err) {
    console.error("Change password error:", err);
    return { success: false, error: "Lỗi đổi mật khẩu" };
  }
}

/**
 * Verify current password by attempting to re-authenticate
 * Uses direct REST API call to avoid messing with Supabase client state/session
 */
export async function verifyCurrentPassword(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabaseUrl || !supabaseAnonKey) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    // API URL for signing in
    const authUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`;

    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      // If auth fails (400 bad request usually), password is wrong
      return { success: false, error: "Mật khẩu hiện tại không đúng" };
    }

    // If success (200), password is correct
    // We just ignore the returned token info (it's just verification)
    return { success: true };
  } catch (err) {
    console.error("Verify password error:", err);
    return { success: false, error: "Lỗi xác thực mật khẩu" };
  }
}

/**
 * Get current user's extended profile
 * Uses direct Fetch to avoid Client hangs
 */
export async function getCurrentProfile(): Promise<ExtendedUserProfile | null> {
  if (!isSupabaseConfigured() || !supabaseUrl || !supabaseAnonKey) {
    console.log("getCurrentProfile: Supabase not configured");
    return null;
  }

  console.log("getCurrentProfile: Starting... (Fetch Mode)");

  try {
    const token = await getAccessToken();
    if (!token) {
      console.log("getCurrentProfile: No token found");
      return null;
    }

    // Attempt to get User ID from localStorage to save a request
    let userId: string | null = null;
    let userEmail: string | null = null;
    let userName: string | null = null;

    try {
      const storageKey = Object.keys(localStorage).find(
        (key) => key.startsWith("sb-") && key.endsWith("-auth-token")
      );
      if (storageKey) {
        const sessionStr = localStorage.getItem(storageKey);
        if (sessionStr) {
          const sessionData = JSON.parse(sessionStr);
          userId = sessionData?.user?.id;
          userEmail = sessionData?.user?.email;
          userName = sessionData?.user?.user_metadata?.display_name;
        }
      }
    } catch (e) {
      console.warn("Error reading localStorage for UserID", e);
    }

    // If no ID from storage, fetch user details
    if (!userId) {
      try {
        const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${token}`,
          },
        });
        if (userResp.ok) {
          const u = await userResp.json();
          userId = u.id;
          userEmail = u.email;
          userName = u.user_metadata?.display_name;
        }
      } catch (e) {
        console.error("Error fetching user details", e);
      }
    }

    if (!userId) {
      console.log("getCurrentProfile: No user ID resolved");
      return null;
    }

    console.log("getCurrentProfile: Fetching profile for user", userId);

    // Fetch Profile via REST
    const response = await fetch(
      `${supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}&select=*`,
      {
        method: "GET",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.pgrst.object+json",
        },
      }
    );

    if (!response.ok) {
      console.warn(
        "Fetch profile failed, returning basic profile",
        response.status
      );
      return {
        id: userId,
        email: userEmail || "",
        display_name: userName || null,
        role: "contributor",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const data = await response.json();
    console.log("getCurrentProfile: Success");
    return data as ExtendedUserProfile;
  } catch (err) {
    console.error("Get current profile error:", err);
    return null;
  }
}
