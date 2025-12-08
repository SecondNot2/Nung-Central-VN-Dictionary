/**
 * Discussion Service
 * Handles discussions with like/reply functionality
 * Supports up to 3 levels of nesting
 */

import { supabase, isSupabaseConfigured } from "./supabaseClient";

export interface Discussion {
  id: string;
  translation_key: string;
  user_id: string | null;
  content: string;
  like_count: number;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  user_name?: string;
  user_avatar?: string;
  is_liked_by_user?: boolean;
  replies?: Discussion[];
  depth?: number; // Track nesting level
}

export type SortOption = "newest" | "oldest" | "most_liked";

const MAX_DEPTH = 4; // Maximum nesting level (4 levels, 3 visual indents)

/**
 * Generate a translation key for identifying discussions
 */
export function generateTranslationKey(
  originalText: string,
  targetLang: string
): string {
  const combined = `${originalText.toLowerCase().trim()}|${targetLang}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `tr_${Math.abs(hash).toString(16)}`;
}

/**
 * Fetch user profile by ID
 */
async function getUserProfile(
  userId: string
): Promise<{ display_name: string | null; avatar_url: string | null } | null> {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("display_name, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Recursively fetch replies up to MAX_DEPTH
 */
async function fetchRepliesRecursive(
  parentId: string,
  currentUserId: string | undefined,
  currentDepth: number
): Promise<Discussion[]> {
  if (currentDepth >= MAX_DEPTH) return [];

  const { data: repliesData } = await supabase
    .from("discussions")
    .select("*")
    .eq("parent_id", parentId)
    .order("created_at", { ascending: true });

  if (!repliesData || repliesData.length === 0) return [];

  return Promise.all(
    repliesData.map(async (r: any) => {
      const replyUserProfile = r.user_id
        ? await getUserProfile(r.user_id)
        : null;

      const reply: Discussion = {
        id: r.id,
        translation_key: r.translation_key,
        user_id: r.user_id,
        content: r.content,
        like_count: r.like_count,
        parent_id: r.parent_id,
        created_at: r.created_at,
        updated_at: r.updated_at,
        user_name: replyUserProfile?.display_name || "Người dùng ẩn danh",
        user_avatar: replyUserProfile?.avatar_url || undefined,
        depth: currentDepth + 1,
      };

      // Check if current user liked
      if (currentUserId) {
        const { data: likeData } = await supabase
          .from("discussion_likes")
          .select("id")
          .eq("discussion_id", r.id)
          .eq("user_id", currentUserId)
          .maybeSingle();
        reply.is_liked_by_user = !!likeData;
      }

      // Fetch nested replies (up to MAX_DEPTH)
      reply.replies = await fetchRepliesRecursive(
        r.id,
        currentUserId,
        currentDepth + 1
      );

      return reply;
    })
  );
}

/**
 * Get discussions for a translation
 */
export async function getDiscussions(
  translationKey: string,
  page: number = 1,
  perPage: number = 10,
  sortBy: SortOption = "newest",
  currentUserId?: string
): Promise<{ discussions: Discussion[]; total: number }> {
  if (!isSupabaseConfigured()) {
    return { discussions: [], total: 0 };
  }

  try {
    // Build query for top-level discussions (parent_id is null)
    let query = supabase
      .from("discussions")
      .select("*", { count: "exact" })
      .eq("translation_key", translationKey)
      .is("parent_id", null);

    // Apply sorting
    switch (sortBy) {
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "most_liked":
        query = query.order("like_count", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    // Apply pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching discussions:", error);
      return { discussions: [], total: 0 };
    }

    // Transform data and fetch all nested replies
    const discussions: Discussion[] = await Promise.all(
      (data || []).map(async (d: any) => {
        const userProfile = d.user_id ? await getUserProfile(d.user_id) : null;

        const discussion: Discussion = {
          id: d.id,
          translation_key: d.translation_key,
          user_id: d.user_id,
          content: d.content,
          like_count: d.like_count,
          parent_id: d.parent_id,
          created_at: d.created_at,
          updated_at: d.updated_at,
          user_name: userProfile?.display_name || "Người dùng ẩn danh",
          user_avatar: userProfile?.avatar_url || undefined,
          depth: 1,
        };

        // Check if current user liked
        if (currentUserId) {
          const { data: likeData } = await supabase
            .from("discussion_likes")
            .select("id")
            .eq("discussion_id", d.id)
            .eq("user_id", currentUserId)
            .maybeSingle();
          discussion.is_liked_by_user = !!likeData;
        }

        // Fetch all nested replies recursively
        discussion.replies = await fetchRepliesRecursive(
          d.id,
          currentUserId,
          1
        );

        return discussion;
      })
    );

    return { discussions, total: count || 0 };
  } catch (err) {
    console.error("Error in getDiscussions:", err);
    return { discussions: [], total: 0 };
  }
}

/**
 * Find the correct parent for a reply (limit to MAX_DEPTH)
 * If already at max depth, reply to the level 2 parent instead
 */
export async function findReplyParentId(discussionId: string): Promise<string> {
  try {
    // Get the discussion we're replying to
    const { data } = await supabase
      .from("discussions")
      .select("id, parent_id")
      .eq("id", discussionId)
      .single();

    if (!data) return discussionId;

    // If this is a top-level comment, reply directly to it
    if (!data.parent_id) return discussionId;

    // Check if parent is also a reply (level 2)
    const { data: parentData } = await supabase
      .from("discussions")
      .select("id, parent_id")
      .eq("id", data.parent_id)
      .single();

    // If parent's parent exists (level 3 would make it level 4), reply to parent instead
    if (parentData?.parent_id) {
      return data.parent_id; // Reply at same level
    }

    return discussionId;
  } catch {
    return discussionId;
  }
}

/**
 * Create a new discussion or reply
 */
export async function createDiscussion(
  translationKey: string,
  userId: string,
  content: string,
  parentId?: string
): Promise<Discussion | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    // If replying, find correct parent to maintain max depth
    let actualParentId = parentId || null;
    if (parentId) {
      actualParentId = await findReplyParentId(parentId);
    }

    const { data, error } = await supabase
      .from("discussions")
      .insert({
        translation_key: translationKey,
        user_id: userId,
        content,
        parent_id: actualParentId,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating discussion:", error);
      return null;
    }

    const userProfile = await getUserProfile(userId);

    return {
      id: data.id,
      translation_key: data.translation_key,
      user_id: data.user_id,
      content: data.content,
      like_count: data.like_count,
      parent_id: data.parent_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user_name: userProfile?.display_name || "Người dùng",
      user_avatar: userProfile?.avatar_url || undefined,
      is_liked_by_user: false,
    };
  } catch (err) {
    console.error("Error in createDiscussion:", err);
    return null;
  }
}

/**
 * Toggle like on a discussion
 */
export async function toggleLike(
  discussionId: string,
  userId: string
): Promise<{ liked: boolean; newCount: number } | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data: existingLike } = await supabase
      .from("discussion_likes")
      .select("id")
      .eq("discussion_id", discussionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingLike) {
      await supabase
        .from("discussion_likes")
        .delete()
        .eq("id", existingLike.id);

      const { data: current } = await supabase
        .from("discussions")
        .select("like_count")
        .eq("id", discussionId)
        .single();

      if (current) {
        await supabase
          .from("discussions")
          .update({ like_count: Math.max(0, current.like_count - 1) })
          .eq("id", discussionId);
      }

      return {
        liked: false,
        newCount: Math.max(0, (current?.like_count || 1) - 1),
      };
    } else {
      await supabase
        .from("discussion_likes")
        .insert({ discussion_id: discussionId, user_id: userId });

      const { data: current } = await supabase
        .from("discussions")
        .select("like_count")
        .eq("id", discussionId)
        .single();

      if (current) {
        await supabase
          .from("discussions")
          .update({ like_count: current.like_count + 1 })
          .eq("id", discussionId);
      }

      return { liked: true, newCount: (current?.like_count || 0) + 1 };
    }
  } catch (err) {
    console.error("Error in toggleLike:", err);
    return null;
  }
}

/**
 * Delete a discussion
 */
export async function deleteDiscussion(discussionId: string): Promise<boolean> {
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
    console.error("Error in deleteDiscussion:", err);
    return false;
  }
}

/**
 * Update a discussion content
 */
export async function updateDiscussion(
  discussionId: string,
  content: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from("discussions")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", discussionId);

    if (error) {
      console.error("Error updating discussion:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in updateDiscussion:", err);
    return false;
  }
}
