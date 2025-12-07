/**
 * Translation History Service
 * Hybrid storage: localStorage for guests, database for logged-in users
 */

import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { TranslationResult, TranslationHistoryItem } from "../types";

const LOCAL_HISTORY_KEY = "translation_history";
const MAX_HISTORY_ITEMS = 50;

// ==================== Guest Storage (localStorage) ====================

function getLocalHistory(): TranslationHistoryItem[] {
  try {
    const saved = localStorage.getItem(LOCAL_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalHistory(history: TranslationHistoryItem[]): void {
  localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history));
}

// ==================== Database Storage ====================

interface DbHistoryItem {
  id: string;
  user_id: string;
  original_text: string;
  source_lang: string;
  target_lang: string;
  result: TranslationResult;
  created_at: string;
}

function dbToHistoryItem(item: DbHistoryItem): TranslationHistoryItem {
  return {
    id: item.id,
    original: item.original_text,
    sourceLang: item.source_lang,
    targetLang: item.target_lang,
    result: item.result,
    timestamp: new Date(item.created_at).getTime(),
  };
}

// ==================== Public API ====================

/**
 * Get translation history
 * @param userId - If provided, fetch from database. Otherwise, use localStorage.
 */
export async function getHistory(
  userId?: string
): Promise<TranslationHistoryItem[]> {
  if (!userId) {
    return getLocalHistory();
  }

  if (!isSupabaseConfigured()) {
    return getLocalHistory();
  }

  try {
    const { data, error } = await supabase
      .from("translation_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(MAX_HISTORY_ITEMS);

    if (error) {
      console.error("Error fetching history:", error);
      return getLocalHistory(); // Fallback to local
    }

    return (data || []).map(dbToHistoryItem);
  } catch (err) {
    console.error("Error in getHistory:", err);
    return getLocalHistory();
  }
}

/**
 * Add item to translation history
 */
export async function addToHistory(
  item: {
    original: string;
    sourceLang: string;
    targetLang: string;
    result: TranslationResult;
  },
  userId?: string
): Promise<TranslationHistoryItem> {
  const newItem: TranslationHistoryItem = {
    id: Date.now().toString(),
    original: item.original,
    sourceLang: item.sourceLang,
    targetLang: item.targetLang,
    result: item.result,
    timestamp: Date.now(),
  };

  if (!userId) {
    // Guest: save to localStorage
    const history = getLocalHistory();
    const filtered = history.filter(
      (h) => h.original.toLowerCase() !== item.original.toLowerCase()
    );
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    saveLocalHistory(updated);
    return newItem;
  }

  if (!isSupabaseConfigured()) {
    const history = getLocalHistory();
    const filtered = history.filter(
      (h) => h.original.toLowerCase() !== item.original.toLowerCase()
    );
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    saveLocalHistory(updated);
    return newItem;
  }

  try {
    const { data, error } = await supabase
      .from("translation_history")
      .insert({
        user_id: userId,
        original_text: item.original,
        source_lang: item.sourceLang,
        target_lang: item.targetLang,
        result: item.result as any,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding to history:", error);
      return newItem;
    }

    return dbToHistoryItem(data);
  } catch (err) {
    console.error("Error in addToHistory:", err);
    return newItem;
  }
}

/**
 * Delete a single history item
 */
export async function deleteHistoryItem(
  id: string,
  userId?: string
): Promise<boolean> {
  if (!userId) {
    const history = getLocalHistory();
    const updated = history.filter((h) => h.id !== id);
    saveLocalHistory(updated);
    return true;
  }

  if (!isSupabaseConfigured()) {
    const history = getLocalHistory();
    const updated = history.filter((h) => h.id !== id);
    saveLocalHistory(updated);
    return true;
  }

  try {
    const { error } = await supabase
      .from("translation_history")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting history item:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in deleteHistoryItem:", err);
    return false;
  }
}

/**
 * Clear all history
 */
export async function clearHistory(userId?: string): Promise<boolean> {
  if (!userId) {
    localStorage.removeItem(LOCAL_HISTORY_KEY);
    return true;
  }

  if (!isSupabaseConfigured()) {
    localStorage.removeItem(LOCAL_HISTORY_KEY);
    return true;
  }

  try {
    const { error } = await supabase
      .from("translation_history")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Error clearing history:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in clearHistory:", err);
    return false;
  }
}

/**
 * Migrate local history to database when user logs in
 */
export async function migrateLocalHistoryToDb(userId: string): Promise<void> {
  const localHistory = getLocalHistory();
  if (localHistory.length === 0) return;

  if (!isSupabaseConfigured()) return;

  try {
    // Insert all local history items to database
    const items = localHistory.map((h) => ({
      user_id: userId,
      original_text: h.original,
      source_lang: h.sourceLang,
      target_lang: h.targetLang,
      result: h.result as any,
      created_at: new Date(h.timestamp).toISOString(),
    }));

    const { error } = await supabase
      .from("translation_history")
      .upsert(items, { onConflict: "id" });

    if (error) {
      console.error("Error migrating history:", error);
      return;
    }

    // Clear local storage after successful migration
    localStorage.removeItem(LOCAL_HISTORY_KEY);
    console.log("Successfully migrated local history to database");
  } catch (err) {
    console.error("Error in migrateLocalHistoryToDb:", err);
  }
}
