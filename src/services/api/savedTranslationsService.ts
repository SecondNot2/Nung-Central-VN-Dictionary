/**
 * Saved Translations Service
 * Handles CRUD operations for user's saved translations
 */

import {
  supabase,
  isSupabaseConfigured,
  getAccessToken,
  supabaseUrl,
  supabaseAnonKey,
} from "./supabaseClient";
import { TranslationResult } from "../../types";

export interface SavedTranslation {
  id: string;
  user_id: string;
  original_text: string;
  source_lang: string;
  target_lang: string;
  result: TranslationResult;
  created_at: string;
}

/**
 * Get all saved translations for a user
 */
export async function getSavedTranslations(
  userId: string
): Promise<SavedTranslation[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from("saved_translations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching saved translations:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in getSavedTranslations:", err);
    return [];
  }
}

/**
 * Save a translation for a user
 */
export async function saveTranslation(
  userId: string,
  originalText: string,
  sourceLang: string,
  targetLang: string,
  result: TranslationResult
): Promise<SavedTranslation | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from("saved_translations")
      .insert({
        user_id: userId,
        original_text: originalText,
        source_lang: sourceLang,
        target_lang: targetLang,
        result: result as any,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving translation:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error in saveTranslation:", err);
    return null;
  }
}

/**
 * Delete a saved translation
 */
export async function deleteSavedTranslation(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from("saved_translations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting saved translation:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in deleteSavedTranslation:", err);
    return false;
  }
}

/**
 * Check if a translation is already saved by user
 */
export async function isTranslationSaved(
  userId: string,
  originalText: string,
  targetLang: string
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from("saved_translations")
      .select("id")
      .eq("user_id", userId)
      .eq("original_text", originalText)
      .eq("target_lang", targetLang)
      .maybeSingle();

    if (error) {
      console.error("Error checking saved translation:", error);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error("Error in isTranslationSaved:", err);
    return null;
  }
}
