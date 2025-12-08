/**
 * Translation Suggestion Service
 * Allows users to suggest corrections/improvements to translations
 */

import { supabase, isSupabaseConfigured } from "./supabaseClient";

export interface TranslationSuggestion {
  id: string;
  user_id: string | null;
  original_text: string;
  source_lang: string;
  target_lang: string;
  original_translation: string;
  suggested_translation: string;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  user_name?: string;
  user_avatar?: string;
}

/**
 * Create a translation suggestion
 */
export async function createSuggestion(
  userId: string,
  originalText: string,
  sourceLang: string,
  targetLang: string,
  originalTranslation: string,
  suggestedTranslation: string,
  reason?: string
): Promise<TranslationSuggestion | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from("translation_suggestions")
      .insert({
        user_id: userId,
        original_text: originalText,
        source_lang: sourceLang,
        target_lang: targetLang,
        original_translation: originalTranslation,
        suggested_translation: suggestedTranslation,
        reason: reason || null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating suggestion:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error in createSuggestion:", err);
    return null;
  }
}

/**
 * Get suggestions by user
 */
export async function getUserSuggestions(
  userId: string
): Promise<TranslationSuggestion[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from("translation_suggestions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching suggestions:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in getUserSuggestions:", err);
    return [];
  }
}

/**
 * Get all pending suggestions (for admin)
 */
export async function getPendingSuggestions(): Promise<
  TranslationSuggestion[]
> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from("translation_suggestions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching pending suggestions:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in getPendingSuggestions:", err);
    return [];
  }
}

/**
 * Update suggestion (for user - only pending)
 */
export async function updateSuggestion(
  suggestionId: string,
  suggestedTranslation: string,
  reason?: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from("translation_suggestions")
      .update({
        suggested_translation: suggestedTranslation,
        reason: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", suggestionId);

    if (error) {
      console.error("Error updating suggestion:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in updateSuggestion:", err);
    return false;
  }
}

/**
 * Delete suggestion (for user - only pending)
 */
export async function deleteSuggestion(suggestionId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from("translation_suggestions")
      .delete()
      .eq("id", suggestionId);

    if (error) {
      console.error("Error deleting suggestion:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in deleteSuggestion:", err);
    return false;
  }
}

/**
 * Review suggestion (for admin)
 */
export async function reviewSuggestion(
  suggestionId: string,
  reviewerId: string,
  status: "approved" | "rejected"
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from("translation_suggestions")
      .update({
        status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", suggestionId);

    if (error) {
      console.error("Error reviewing suggestion:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in reviewSuggestion:", err);
    return false;
  }
}
