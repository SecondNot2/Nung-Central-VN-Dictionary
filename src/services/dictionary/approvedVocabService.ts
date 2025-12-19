/**
 * Approved Vocab Service
 * Fetches and caches approved contributions from Supabase
 * to be merged with the static NUNG_DICTIONARY for lookup
 */

import { supabase, isSupabaseConfigured } from "../api/supabaseClient";
import type { NungWord } from "../../data";

// Extended NungWord with contribution metadata
export interface ContributedWord extends NungWord {
  source?: string;
  contributionId?: string;
  vietnameseWord?: string;
}

// Cache for approved contributions
let approvedContributionsCache: Map<string, ContributedWord> = new Map();
let lastFetchTime: number = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Contribution type from Supabase
interface ApprovedContribution {
  id: string;
  word: string;
  translation: string;
  phonetic: string | null;
  region: string | null;
  example: string | null;
  meaning: string | null;
  source_lang: string;
  target_lang: string;
  status: string;
  created_at: string;
}

/**
 * Fetch approved contributions from Supabase
 * Returns cached data if within cache duration
 */
export async function getApprovedContributions(): Promise<ContributedWord[]> {
  const map = await getApprovedContributionsMap();
  return Array.from(map.values());
}

/**
 * Get approved contributions as a dictionary map
 * Key is the Vietnamese word, value is the ContributedWord entry
 */
export async function getApprovedContributionsMap(): Promise<
  Map<string, ContributedWord>
> {
  // Return cached data if still valid
  const now = Date.now();
  if (
    approvedContributionsCache.size > 0 &&
    now - lastFetchTime < CACHE_DURATION_MS
  ) {
    return approvedContributionsCache;
  }

  if (!isSupabaseConfigured()) {
    // Return empty map if Supabase not configured
    return new Map();
  }

  try {
    const { data, error } = await supabase
      .from("contributions")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching approved contributions:", error);
      return approvedContributionsCache; // Return cached data on error
    }

    // Convert to ContributedWord format and build map
    approvedContributionsCache = new Map();
    for (const contribution of data as ApprovedContribution[]) {
      const word = convertToContributedWord(contribution);
      const key = contribution.word.toLowerCase().trim();
      // Don't override if already exists (first one wins)
      if (!approvedContributionsCache.has(key)) {
        approvedContributionsCache.set(key, word);
      }
    }
    lastFetchTime = now;

    return approvedContributionsCache;
  } catch (err) {
    console.error("Error in getApprovedContributionsMap:", err);
    return approvedContributionsCache;
  }
}

/**
 * Convert a contribution to ContributedWord format (compatible with NungWord)
 */
function convertToContributedWord(
  contribution: ApprovedContribution
): ContributedWord {
  return {
    script: contribution.translation,
    category: "noun", // Default for contributions
    isRoot: true,
    phonetic: contribution.phonetic || "",
    notes: contribution.example || undefined,
    // Extended fields for contributions
    source: "contribution",
    contributionId: contribution.id,
    vietnameseWord: contribution.word,
  };
}

/**
 * Clear the cache to force a fresh fetch
 */
export function clearApprovedContributionsCache(): void {
  approvedContributionsCache = new Map();
  lastFetchTime = 0;
}

/**
 * Get cache status for debugging
 */
export function getApprovedCacheStatus(): {
  cachedCount: number;
  lastFetchTime: number;
  isStale: boolean;
} {
  const now = Date.now();
  return {
    cachedCount: approvedContributionsCache.size,
    lastFetchTime,
    isStale: now - lastFetchTime >= CACHE_DURATION_MS,
  };
}
