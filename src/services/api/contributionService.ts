/**
 * Contribution Service
 * CRUD operations for contributions using Supabase
 */

import { supabase, isSupabaseConfigured } from "./supabaseClient";

// Types matching database schema
export interface ContributionInput {
  word: string;
  translation: string;
  source_lang: string;
  target_lang: string;
  phonetic?: string;
  region?: string;
  example?: string;
  meaning?: string;
}

export interface Contribution extends ContributionInput {
  id: string;
  status: "pending" | "approved" | "rejected";
  reject_reason?: string;
  contributor_id?: string;
  reviewer_id?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface ContributionUpdate {
  word?: string;
  translation?: string;
  phonetic?: string;
  region?: string;
  example?: string;
  meaning?: string;
}

// Local storage key for offline fallback
const LOCAL_CONTRIBUTIONS_KEY = "user_contributions";

/**
 * Get local contributions from localStorage
 */
const getLocalContributions = (): Contribution[] => {
  try {
    const saved = localStorage.getItem(LOCAL_CONTRIBUTIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

/**
 * Save contributions to localStorage
 */
const saveLocalContributions = (contributions: Contribution[]) => {
  localStorage.setItem(LOCAL_CONTRIBUTIONS_KEY, JSON.stringify(contributions));
};

/**
 * Submit a new contribution
 */
export const submitContribution = async (
  input: ContributionInput
): Promise<{ success: boolean; data?: Contribution; error?: string }> => {
  // Try Supabase first
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("contributions")
        .insert([
          {
            word: input.word,
            translation: input.translation,
            source_lang: input.source_lang,
            target_lang: input.target_lang,
            phonetic: input.phonetic || null,
            region: input.region || null,
            example: input.example || null,
            meaning: input.meaning || null,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Also save to localStorage for quick access
      const localContribs = getLocalContributions();
      saveLocalContributions([data, ...localContribs]);

      return { success: true, data };
    } catch (err) {
      console.error("Supabase submit error:", err);
      // Fall through to localStorage fallback
    }
  }

  // Fallback: save to localStorage only
  const localContribution: Contribution = {
    id: `local_${Date.now()}`,
    ...input,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  const localContribs = getLocalContributions();
  saveLocalContributions([localContribution, ...localContribs]);

  return {
    success: true,
    data: localContribution,
    error: isSupabaseConfigured()
      ? "Đã lưu offline. Sẽ đồng bộ khi có kết nối."
      : undefined,
  };
};

/**
 * Get contributions with optional status filter
 */
export const getContributions = async (
  statusFilter?: "pending" | "approved" | "rejected"
): Promise<{ success: boolean; data: Contribution[]; error?: string }> => {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from("contributions")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (err) {
      console.error("Supabase fetch error:", err);
    }
  }

  // Fallback to localStorage
  let localData = getLocalContributions();
  if (statusFilter) {
    localData = localData.filter((c) => c.status === statusFilter);
  }

  return { success: true, data: localData };
};

/**
 * Get contribution counts by status
 */
export const getContributionCounts = async (): Promise<{
  pending: number;
  approved: number;
  rejected: number;
  all: number;
}> => {
  if (isSupabaseConfigured()) {
    try {
      // Fetch all counts in parallel
      const [pendingResult, approvedResult, rejectedResult, allResult] =
        await Promise.all([
          supabase
            .from("contributions")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
          supabase
            .from("contributions")
            .select("*", { count: "exact", head: true })
            .eq("status", "approved"),
          supabase
            .from("contributions")
            .select("*", { count: "exact", head: true })
            .eq("status", "rejected"),
          supabase
            .from("contributions")
            .select("*", { count: "exact", head: true }),
        ]);

      return {
        pending: pendingResult.count || 0,
        approved: approvedResult.count || 0,
        rejected: rejectedResult.count || 0,
        all: allResult.count || 0,
      };
    } catch (err) {
      console.error("Error fetching contribution counts:", err);
    }
  }

  // Fallback to localStorage
  const localData = getLocalContributions();
  return {
    pending: localData.filter((c) => c.status === "pending").length,
    approved: localData.filter((c) => c.status === "approved").length,
    rejected: localData.filter((c) => c.status === "rejected").length,
    all: localData.length,
  };
};

/**
 * Update a contribution (for editing before approval)
 */
export const updateContribution = async (
  id: string,
  updates: ContributionUpdate
): Promise<{ success: boolean; data?: Contribution; error?: string }> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("contributions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update localStorage too
      const localContribs = getLocalContributions();
      const idx = localContribs.findIndex((c) => c.id === id);
      if (idx >= 0) {
        localContribs[idx] = { ...localContribs[idx], ...updates };
        saveLocalContributions(localContribs);
      }

      return { success: true, data };
    } catch (err) {
      console.error("Supabase update error:", err);
      return { success: false, error: "Không thể cập nhật đóng góp" };
    }
  }

  // Update localStorage only
  const localContribs = getLocalContributions();
  const idx = localContribs.findIndex((c) => c.id === id);
  if (idx >= 0) {
    localContribs[idx] = { ...localContribs[idx], ...updates };
    saveLocalContributions(localContribs);
    return { success: true, data: localContribs[idx] };
  }

  return { success: false, error: "Không tìm thấy đóng góp" };
};

/**
 * Approve a contribution
 */
export const approveContribution = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from("contributions")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Update localStorage
      const localContribs = getLocalContributions();
      const idx = localContribs.findIndex((c) => c.id === id);
      if (idx >= 0) {
        localContribs[idx].status = "approved";
        saveLocalContributions(localContribs);
      }

      return { success: true };
    } catch (err) {
      console.error("Supabase approve error:", err);
      return { success: false, error: "Không thể duyệt đóng góp" };
    }
  }

  return { success: false, error: "Chưa cấu hình Supabase" };
};

/**
 * Reject a contribution with reason
 */
export const rejectContribution = async (
  id: string,
  reason: string
): Promise<{ success: boolean; error?: string }> => {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from("contributions")
        .update({
          status: "rejected",
          reject_reason: reason,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Update localStorage
      const localContribs = getLocalContributions();
      const idx = localContribs.findIndex((c) => c.id === id);
      if (idx >= 0) {
        localContribs[idx].status = "rejected";
        localContribs[idx].reject_reason = reason;
        saveLocalContributions(localContribs);
      }

      return { success: true };
    } catch (err) {
      console.error("Supabase reject error:", err);
      return { success: false, error: "Không thể từ chối đóng góp" };
    }
  }

  return { success: false, error: "Chưa cấu hình Supabase" };
};

/**
 * Delete a contribution
 */
export const deleteContribution = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  // Always remove from localStorage
  const localContribs = getLocalContributions();
  const filtered = localContribs.filter((c) => c.id !== id);
  saveLocalContributions(filtered);

  // Try Supabase if configured
  if (isSupabaseConfigured() && !id.startsWith("local_")) {
    try {
      const { error } = await supabase
        .from("contributions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (err) {
      console.error("Supabase delete error:", err);
      return { success: false, error: "Không thể xóa trên server" };
    }
  }

  return { success: true };
};
