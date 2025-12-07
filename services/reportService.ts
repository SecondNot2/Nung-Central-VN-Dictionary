/**
 * Discussion Report Service
 * Handles reporting and managing reported comments
 */

import { supabase, isSupabaseConfigured } from "./supabaseClient";

export interface DiscussionReport {
  id: string;
  discussion_id: string;
  reporter_id: string;
  reason: string | null;
  status: "pending" | "resolved" | "dismissed";
  reviewed_by: string | null;
  reviewed_at: string | null;
  action_taken: string | null;
  created_at: string;
  // Joined data
  discussion_content?: string;
  discussion_user_id?: string;
  discussion_user_name?: string;
  reporter_name?: string;
}

/**
 * Create a report for a discussion/comment
 */
export async function createReport(
  discussionId: string,
  reporterId: string,
  reason?: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from("discussion_reports").insert({
      discussion_id: discussionId,
      reporter_id: reporterId,
      reason: reason || null,
    });

    if (error) {
      // Unique constraint violation = already reported
      if (error.code === "23505") {
        console.log("User already reported this comment");
        return true;
      }
      console.error("Error creating report:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in createReport:", err);
    return false;
  }
}

/**
 * Get all reports (for admin)
 */
export async function getAllReports(
  status?: "pending" | "resolved" | "dismissed"
): Promise<DiscussionReport[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    let query = supabase
      .from("discussion_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching reports:", error);
      return [];
    }

    // Fetch discussion details for each report
    const reportsWithDetails = await Promise.all(
      (data || []).map(async (report) => {
        // Get discussion
        const { data: discussion } = await supabase
          .from("discussions")
          .select("content, user_id")
          .eq("id", report.discussion_id)
          .single();

        // Get discussion author name
        let discussionUserName = "Người dùng ẩn danh";
        if (discussion?.user_id) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("display_name")
            .eq("id", discussion.user_id)
            .single();
          if (profile?.display_name) {
            discussionUserName = profile.display_name;
          }
        }

        // Get reporter name
        let reporterName = "Người dùng ẩn danh";
        const { data: reporterProfile } = await supabase
          .from("user_profiles")
          .select("display_name")
          .eq("id", report.reporter_id)
          .single();
        if (reporterProfile?.display_name) {
          reporterName = reporterProfile.display_name;
        }

        return {
          ...report,
          discussion_content: discussion?.content || "[Đã bị xóa]",
          discussion_user_id: discussion?.user_id,
          discussion_user_name: discussionUserName,
          reporter_name: reporterName,
        };
      })
    );

    return reportsWithDetails;
  } catch (err) {
    console.error("Error in getAllReports:", err);
    return [];
  }
}

/**
 * Review a report (for admin)
 */
export async function reviewReport(
  reportId: string,
  reviewerId: string,
  status: "resolved" | "dismissed",
  actionTaken?: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from("discussion_reports")
      .update({
        status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        action_taken: actionTaken || null,
      })
      .eq("id", reportId);

    if (error) {
      console.error("Error reviewing report:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in reviewReport:", err);
    return false;
  }
}

/**
 * Delete a discussion/comment (for admin action on report)
 */
export async function deleteReportedDiscussion(
  discussionId: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from("discussions")
      .delete()
      .eq("id", discussionId);

    if (error) {
      console.error("Error deleting discussion:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in deleteReportedDiscussion:", err);
    return false;
  }
}
