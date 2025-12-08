/**
 * Feedback Service
 * Handles bug reports, feature requests, and suggestions
 */

import { supabase, isSupabaseConfigured } from "./supabaseClient";

export interface Feedback {
  id: string;
  user_id: string | null;
  type: "bug" | "feature" | "suggestion";
  title: string;
  description: string;
  category: string | null;
  priority: "low" | "medium" | "high" | "critical";
  status: "new" | "in_progress" | "resolved" | "closed" | "wont_fix";
  admin_response: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  user_name?: string;
  user_email?: string;
  reviewer_name?: string;
}

export interface FeedbackStats {
  total: number;
  bugs: number;
  features: number;
  suggestions: number;
  new: number;
  in_progress: number;
  resolved: number;
}

/**
 * Create new feedback (bug report, feature request, or suggestion)
 */
export async function createFeedback(
  userId: string | null,
  type: "bug" | "feature" | "suggestion",
  title: string,
  description: string,
  category?: string,
  priority: "low" | "medium" | "high" | "critical" = "medium"
): Promise<Feedback | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from("feedback")
      .insert({
        user_id: userId,
        type,
        title,
        description,
        category: category || null,
        priority,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating feedback:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error in createFeedback:", err);
    return null;
  }
}

/**
 * Get feedback for a specific user
 */
export async function getUserFeedback(userId: string): Promise<Feedback[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user feedback:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in getUserFeedback:", err);
    return [];
  }
}

/**
 * Get all feedback (for admin)
 */
export async function getAllFeedback(
  type?: "bug" | "feature" | "suggestion",
  status?: string
): Promise<Feedback[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    let query = supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (type) {
      query = query.eq("type", type);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching all feedback:", error);
      return [];
    }

    // Fetch user details for each feedback
    const feedbackWithUsers = await Promise.all(
      (data || []).map(async (fb) => {
        let userName = "Ẩn danh";
        let userEmail = "";

        if (fb.user_id) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("display_name, email")
            .eq("id", fb.user_id)
            .single();

          if (profile) {
            userName = profile.display_name || "Người dùng";
            userEmail = profile.email || "";
          }
        }

        let reviewerName = "";
        if (fb.reviewed_by) {
          const { data: reviewer } = await supabase
            .from("user_profiles")
            .select("display_name")
            .eq("id", fb.reviewed_by)
            .single();

          if (reviewer) {
            reviewerName = reviewer.display_name || "";
          }
        }

        return {
          ...fb,
          user_name: userName,
          user_email: userEmail,
          reviewer_name: reviewerName,
        };
      })
    );

    return feedbackWithUsers;
  } catch (err) {
    console.error("Error in getAllFeedback:", err);
    return [];
  }
}

/**
 * Update feedback status (for admin)
 */
export async function updateFeedbackStatus(
  feedbackId: string,
  status: "new" | "in_progress" | "resolved" | "closed" | "wont_fix",
  adminResponse: string | null,
  reviewerId: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from("feedback")
      .update({
        status,
        admin_response: adminResponse,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", feedbackId);

    if (error) {
      console.error("Error updating feedback:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in updateFeedbackStatus:", err);
    return false;
  }
}

/**
 * Get feedback statistics (for admin dashboard)
 */
export async function getFeedbackStats(): Promise<FeedbackStats> {
  if (!isSupabaseConfigured()) {
    return {
      total: 0,
      bugs: 0,
      features: 0,
      suggestions: 0,
      new: 0,
      in_progress: 0,
      resolved: 0,
    };
  }

  try {
    const { data, error } = await supabase
      .from("feedback")
      .select("type, status");

    if (error) {
      console.error("Error fetching feedback stats:", error);
      return {
        total: 0,
        bugs: 0,
        features: 0,
        suggestions: 0,
        new: 0,
        in_progress: 0,
        resolved: 0,
      };
    }

    const stats: FeedbackStats = {
      total: data?.length || 0,
      bugs: data?.filter((f) => f.type === "bug").length || 0,
      features: data?.filter((f) => f.type === "feature").length || 0,
      suggestions: data?.filter((f) => f.type === "suggestion").length || 0,
      new: data?.filter((f) => f.status === "new").length || 0,
      in_progress: data?.filter((f) => f.status === "in_progress").length || 0,
      resolved: data?.filter((f) => f.status === "resolved").length || 0,
    };

    return stats;
  } catch (err) {
    console.error("Error in getFeedbackStats:", err);
    return {
      total: 0,
      bugs: 0,
      features: 0,
      suggestions: 0,
      new: 0,
      in_progress: 0,
      resolved: 0,
    };
  }
}

/**
 * Delete feedback (for admin)
 */
export async function deleteFeedback(feedbackId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from("feedback")
      .delete()
      .eq("id", feedbackId);

    if (error) {
      console.error("Error deleting feedback:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in deleteFeedback:", err);
    return false;
  }
}
