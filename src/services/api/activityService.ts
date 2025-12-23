/**
 * Activity Service
 * Fetches and normalizes recent activities from multiple sources
 */

import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { AppRoute } from "../../types";

// Activity types
export type ActivityType =
  | "contribution"
  | "suggestion"
  | "feedback"
  | "report"
  | "user"
  | "dictionary";

export type ActivityAction =
  | "created"
  | "approved"
  | "rejected"
  | "updated"
  | "resolved"
  | "registered";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  action: ActivityAction;
  title: string;
  description: string;
  user_name?: string;
  user_avatar?: string;
  created_at: string;
  route?: AppRoute;
  metadata?: Record<string, unknown>;
}

// Icon and color mapping for activity types
export const activityConfig: Record<
  ActivityType,
  { icon: string; label: string }
> = {
  contribution: { icon: "fa-file-circle-plus", label: "Đóng góp" },
  suggestion: { icon: "fa-pen-to-square", label: "Đề xuất" },
  feedback: { icon: "fa-comment-dots", label: "Phản hồi" },
  report: { icon: "fa-flag", label: "Báo cáo" },
  user: { icon: "fa-user", label: "Người dùng" },
  dictionary: { icon: "fa-book", label: "Từ điển" },
};

export const actionConfig: Record<
  ActivityAction,
  { color: string; bgColor: string; label: string }
> = {
  created: {
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    label: "Tạo mới",
  },
  approved: {
    color: "text-green-600",
    bgColor: "bg-green-50",
    label: "Đã duyệt",
  },
  rejected: {
    color: "text-red-600",
    bgColor: "bg-red-50",
    label: "Từ chối",
  },
  updated: {
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    label: "Cập nhật",
  },
  resolved: {
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    label: "Đã xử lý",
  },
  registered: {
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    label: "Đăng ký",
  },
};

/**
 * Get user display name from user_profiles
 */
async function getUserName(userId: string | null): Promise<string> {
  if (!userId) return "Ẩn danh";

  try {
    const { data } = await supabase
      .from("user_profiles")
      .select("display_name")
      .eq("id", userId)
      .single();

    return data?.display_name || "Người dùng";
  } catch {
    return "Người dùng";
  }
}

/**
 * Fetch recent contributions
 */
async function fetchRecentContributions(
  limit: number
): Promise<ActivityItem[]> {
  try {
    const { data, error } = await supabase
      .from("contributions")
      .select(
        "id, word, translation, status, contributor_id, created_at, reviewed_at"
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    const activities: ActivityItem[] = [];

    for (const item of data) {
      const userName = await getUserName(item.contributor_id);

      // Created activity
      activities.push({
        id: `contrib-created-${item.id}`,
        type: "contribution",
        action: "created",
        title: `Đóng góp từ vựng mới`,
        description: `"${item.word}" → "${item.translation}"`,
        user_name: userName,
        created_at: item.created_at,
        route: AppRoute.ADMIN,
        metadata: { contributionId: item.id },
      });

      // If reviewed, add approval/rejection activity
      if (item.status === "approved" && item.reviewed_at) {
        activities.push({
          id: `contrib-approved-${item.id}`,
          type: "contribution",
          action: "approved",
          title: `Đóng góp đã được duyệt`,
          description: `"${item.word}" → "${item.translation}"`,
          user_name: "Admin",
          created_at: item.reviewed_at,
          route: AppRoute.ADMIN,
        });
      } else if (item.status === "rejected" && item.reviewed_at) {
        activities.push({
          id: `contrib-rejected-${item.id}`,
          type: "contribution",
          action: "rejected",
          title: `Đóng góp bị từ chối`,
          description: `"${item.word}"`,
          user_name: "Admin",
          created_at: item.reviewed_at,
          route: AppRoute.ADMIN,
        });
      }
    }

    return activities;
  } catch (err) {
    console.error("Error fetching contributions:", err);
    return [];
  }
}

/**
 * Fetch recent suggestions
 */
async function fetchRecentSuggestions(limit: number): Promise<ActivityItem[]> {
  try {
    const { data, error } = await supabase
      .from("translation_suggestions")
      .select(
        "id, original_text, suggested_translation, status, user_id, created_at, reviewed_at"
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    const activities: ActivityItem[] = [];

    for (const item of data) {
      const userName = await getUserName(item.user_id);

      activities.push({
        id: `sugg-created-${item.id}`,
        type: "suggestion",
        action: "created",
        title: `Đề xuất chỉnh sửa bản dịch`,
        description: `"${item.original_text?.substring(0, 30)}${
          item.original_text?.length > 30 ? "..." : ""
        }"`,
        user_name: userName,
        created_at: item.created_at,
        route: AppRoute.ADMIN_SUGGESTIONS,
      });

      if (item.status === "approved" && item.reviewed_at) {
        activities.push({
          id: `sugg-approved-${item.id}`,
          type: "suggestion",
          action: "approved",
          title: `Đề xuất đã được duyệt`,
          description: `→ "${item.suggested_translation?.substring(0, 30)}${
            item.suggested_translation?.length > 30 ? "..." : ""
          }"`,
          user_name: "Admin",
          created_at: item.reviewed_at,
          route: AppRoute.ADMIN_SUGGESTIONS,
        });
      } else if (item.status === "rejected" && item.reviewed_at) {
        activities.push({
          id: `sugg-rejected-${item.id}`,
          type: "suggestion",
          action: "rejected",
          title: `Đề xuất bị từ chối`,
          description: `"${item.original_text?.substring(0, 30)}..."`,
          user_name: "Admin",
          created_at: item.reviewed_at,
          route: AppRoute.ADMIN_SUGGESTIONS,
        });
      }
    }

    return activities;
  } catch (err) {
    console.error("Error fetching suggestions:", err);
    return [];
  }
}

/**
 * Fetch recent feedback
 */
async function fetchRecentFeedback(limit: number): Promise<ActivityItem[]> {
  try {
    const { data, error } = await supabase
      .from("feedback")
      .select("id, type, title, status, user_id, created_at, reviewed_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    const activities: ActivityItem[] = [];

    const typeLabels: Record<string, string> = {
      bug: "🐛 Báo lỗi",
      feature: "💡 Yêu cầu tính năng",
      suggestion: "📝 Góp ý",
    };

    for (const item of data) {
      const userName = await getUserName(item.user_id);

      activities.push({
        id: `feedback-created-${item.id}`,
        type: "feedback",
        action: "created",
        title: typeLabels[item.type] || "Phản hồi mới",
        description: item.title,
        user_name: userName,
        created_at: item.created_at,
        route: AppRoute.ADMIN_FEEDBACK,
      });

      if (item.status === "resolved" && item.reviewed_at) {
        activities.push({
          id: `feedback-resolved-${item.id}`,
          type: "feedback",
          action: "resolved",
          title: `Phản hồi đã xử lý`,
          description: item.title,
          user_name: "Admin",
          created_at: item.reviewed_at,
          route: AppRoute.ADMIN_FEEDBACK,
        });
      }
    }

    return activities;
  } catch (err) {
    console.error("Error fetching feedback:", err);
    return [];
  }
}

/**
 * Fetch recent reports
 */
async function fetchRecentReports(limit: number): Promise<ActivityItem[]> {
  try {
    const { data, error } = await supabase
      .from("discussion_reports")
      .select("id, reason, status, reporter_id, created_at, reviewed_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    const activities: ActivityItem[] = [];

    for (const item of data) {
      const userName = await getUserName(item.reporter_id);

      activities.push({
        id: `report-created-${item.id}`,
        type: "report",
        action: "created",
        title: `Báo cáo bình luận vi phạm`,
        description: item.reason || "Không có lý do",
        user_name: userName,
        created_at: item.created_at,
        route: AppRoute.ADMIN_REPORTS,
      });

      if (item.status !== "pending" && item.reviewed_at) {
        activities.push({
          id: `report-resolved-${item.id}`,
          type: "report",
          action: "resolved",
          title: `Báo cáo đã xử lý`,
          description: `Kết quả: ${item.status}`,
          user_name: "Admin",
          created_at: item.reviewed_at,
          route: AppRoute.ADMIN_REPORTS,
        });
      }
    }

    return activities;
  } catch (err) {
    console.error("Error fetching reports:", err);
    return [];
  }
}

/**
 * Fetch recent user registrations
 */
async function fetchRecentUsers(limit: number): Promise<ActivityItem[]> {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id, display_name, avatar_url, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((user) => ({
      id: `user-registered-${user.id}`,
      type: "user" as ActivityType,
      action: "registered" as ActivityAction,
      title: `Người dùng mới đăng ký`,
      description: user.display_name || "Người dùng",
      user_name: user.display_name || "Người dùng",
      user_avatar: user.avatar_url,
      created_at: user.created_at,
      route: AppRoute.ADMIN_USERS,
    }));
  } catch (err) {
    console.error("Error fetching users:", err);
    return [];
  }
}

/**
 * Fetch recent dictionary changes
 */
async function fetchRecentDictionaryChanges(
  limit: number
): Promise<ActivityItem[]> {
  try {
    const { data, error } = await supabase
      .from("dictionary_entries")
      .select("id, word, translation, created_at, updated_at, created_by")
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    const activities: ActivityItem[] = [];

    for (const item of data) {
      const isNew =
        new Date(item.created_at).getTime() ===
        new Date(item.updated_at).getTime();

      activities.push({
        id: `dict-${isNew ? "created" : "updated"}-${item.id}`,
        type: "dictionary",
        action: isNew ? "created" : "updated",
        title: isNew ? `Thêm từ mới vào từ điển` : `Cập nhật từ điển`,
        description: `"${item.word}" → "${item.translation}"`,
        user_name: "Admin",
        created_at: item.updated_at,
        route: AppRoute.ADMIN_DICTIONARY,
      });
    }

    return activities;
  } catch (err) {
    console.error("Error fetching dictionary changes:", err);
    return [];
  }
}

/**
 * Get all recent activities from multiple sources
 */
export async function getRecentActivities(
  limit: number = 15
): Promise<ActivityItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    // Fetch from all sources in parallel
    const [contributions, suggestions, feedback, reports, users, dictionary] =
      await Promise.all([
        fetchRecentContributions(10),
        fetchRecentSuggestions(10),
        fetchRecentFeedback(10),
        fetchRecentReports(10),
        fetchRecentUsers(5),
        fetchRecentDictionaryChanges(5),
      ]);

    // Merge all activities
    const allActivities = [
      ...contributions,
      ...suggestions,
      ...feedback,
      ...reports,
      ...users,
      ...dictionary,
    ];

    // Sort by created_at descending
    allActivities.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Return limited results
    return allActivities.slice(0, limit);
  } catch (err) {
    console.error("Error in getRecentActivities:", err);
    return [];
  }
}

/**
 * Format relative time
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
