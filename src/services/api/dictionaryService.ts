/**
 * Dictionary Service
 * Handles CRUD operations for dictionary entries in Supabase
 */

import { supabase, isSupabaseConfigured } from "./supabaseClient";

// Dictionary entry type matching Supabase schema
export interface DictionaryEntryDB {
  id: string;
  word: string;
  translation: string;
  phonetic: string | null;
  language: "nung" | "central";
  example: string | null;
  notes: string | null;
  status: "approved" | "pending" | "rejected";
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Input type for creating/updating entries
export interface DictionaryEntryInput {
  word: string;
  translation: string;
  phonetic?: string;
  language?: "nung" | "central";
  example?: string;
  notes?: string;
  status?: "approved" | "pending" | "rejected";
}

// Local storage key for offline cache
const CACHE_KEY = "dictionary_entries_cache";
const CACHE_TIMESTAMP_KEY = "dictionary_entries_cache_timestamp";

/**
 * Get all dictionary entries from Supabase
 */
export async function getDictionaryEntriesFromDB(options?: {
  language?: "nung" | "central";
  status?: "approved" | "pending" | "rejected";
  search?: string;
}): Promise<{ data: DictionaryEntryDB[] | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    // Return cached data
    const cached = getCachedEntries();
    return { data: cached, error: null };
  }

  try {
    let query = supabase.from("dictionary_entries").select("*");

    if (options?.language) {
      query = query.eq("language", options.language);
    }
    if (options?.status) {
      query = query.eq("status", options.status);
    }
    if (options?.search) {
      query = query.or(
        `word.ilike.%${options.search}%,translation.ilike.%${options.search}%`
      );
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching dictionary entries:", error);
      return { data: null, error: error.message };
    }

    // Cache the data
    setCachedEntries(data as DictionaryEntryDB[]);

    return { data: data as DictionaryEntryDB[], error: null };
  } catch (err) {
    console.error("Error in getDictionaryEntriesFromDB:", err);
    return { data: getCachedEntries(), error: "Connection error" };
  }
}

/**
 * Add a new dictionary entry
 */
export async function addDictionaryEntry(
  entry: DictionaryEntryInput
): Promise<{ data: DictionaryEntryDB | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    // Save to local storage
    const newEntry = createLocalEntry(entry);
    addToLocalCache(newEntry);
    return { data: newEntry, error: null };
  }

  try {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("dictionary_entries")
      .insert({
        word: entry.word,
        translation: entry.translation,
        phonetic: entry.phonetic || null,
        language: entry.language || "nung",
        example: entry.example || null,
        notes: entry.notes || null,
        status: entry.status || "approved",
        created_by: user?.user?.id || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding dictionary entry:", error);
      return { data: null, error: error.message };
    }

    return { data: data as DictionaryEntryDB, error: null };
  } catch (err) {
    console.error("Error in addDictionaryEntry:", err);
    // Fallback to local storage
    const newEntry = createLocalEntry(entry);
    addToLocalCache(newEntry);
    return { data: newEntry, error: null };
  }
}

/**
 * Update an existing dictionary entry
 */
export async function updateDictionaryEntry(
  id: string,
  updates: Partial<DictionaryEntryInput>
): Promise<{ data: DictionaryEntryDB | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const updated = updateLocalEntry(id, updates);
    return { data: updated, error: updated ? null : "Entry not found" };
  }

  try {
    const { data, error } = await supabase
      .from("dictionary_entries")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating dictionary entry:", error);
      return { data: null, error: error.message };
    }

    return { data: data as DictionaryEntryDB, error: null };
  } catch (err) {
    console.error("Error in updateDictionaryEntry:", err);
    return { data: null, error: "Connection error" };
  }
}

/**
 * Delete a dictionary entry
 */
export async function deleteDictionaryEntry(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    deleteFromLocalCache(id);
    return { success: true, error: null };
  }

  try {
    const { error } = await supabase
      .from("dictionary_entries")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting dictionary entry:", error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("Error in deleteDictionaryEntry:", err);
    return { success: false, error: "Connection error" };
  }
}

/**
 * Get approved entries count
 */
export async function getApprovedEntriesCount(): Promise<number> {
  if (!isSupabaseConfigured()) {
    const cached = getCachedEntries();
    return cached.filter((e) => e.status === "approved").length;
  }

  try {
    const { count, error } = await supabase
      .from("dictionary_entries")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");

    if (error) {
      return 0;
    }

    return count || 0;
  } catch {
    return 0;
  }
}

// ==================== Local Storage Helpers ====================

function getCachedEntries(): DictionaryEntryDB[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Ignore errors
  }
  return [];
}

function setCachedEntries(entries: DictionaryEntryDB[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch {
    // Ignore errors
  }
}

function createLocalEntry(entry: DictionaryEntryInput): DictionaryEntryDB {
  const now = new Date().toISOString();
  return {
    id: `local_${Date.now()}`,
    word: entry.word,
    translation: entry.translation,
    phonetic: entry.phonetic || null,
    language: entry.language || "nung",
    example: entry.example || null,
    notes: entry.notes || null,
    status: entry.status || "approved",
    created_by: null,
    created_at: now,
    updated_at: now,
  };
}

function addToLocalCache(entry: DictionaryEntryDB): void {
  const entries = getCachedEntries();
  entries.unshift(entry);
  setCachedEntries(entries);
}

function updateLocalEntry(
  id: string,
  updates: Partial<DictionaryEntryInput>
): DictionaryEntryDB | null {
  const entries = getCachedEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) return null;

  entries[index] = {
    ...entries[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  setCachedEntries(entries);
  return entries[index];
}

function deleteFromLocalCache(id: string): void {
  const entries = getCachedEntries();
  const filtered = entries.filter((e) => e.id !== id);
  setCachedEntries(filtered);
}
