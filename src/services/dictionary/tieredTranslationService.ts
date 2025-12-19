/**
 * Tiered Translation Service
 * Tối ưu tốc độ dịch bằng cách tra cứu 3 tầng:
 * 1. Local Dictionary - CỤM TỪ trước (sử dụng smartLookup)
 * 2. Database Contributions (Supabase)
 * 3. MegaLLM API (chỉ cho từ thực sự không tìm thấy)
 */

import { NUNG_DICTIONARY, type NungWord } from "../../data";
import {
  smartLookup,
  lookupWord,
  inferWordFromPhrases,
  type InferredWord,
} from "./nungVocab";
import {
  getApprovedContributionsMap,
  type ContributedWord,
} from "./approvedVocabService";
import {
  translateMissingWords,
  saveApiDiscoveredWord,
} from "../ai/megaLlmService";

// ==================== Types ====================

export interface WordBreakdown {
  word: string;
  translation: string;
  source: "local" | "db" | "api" | "inferred" | "unknown";
  confidence?: "high" | "medium" | "low";
  notes?: string;
  category?: string; // category from NungWord
}

export interface TieredTranslationResult {
  original: string;
  translation: string;
  breakdown: WordBreakdown[];
  stats: {
    totalWords: number;
    localHits: number;
    dbHits: number;
    inferred: number;
    apiCalls: number;
    unknown: number;
  };
  apiCalled: boolean;
  timeTaken: number; // milliseconds
}

// ==================== Main Translation Function ====================

/**
 * Smart translation using 3-tier lookup system
 * QUAN TRỌNG: Tìm CỤM TỪ trước, sau đó mới tìm từ đơn
 * @param text Vietnamese text to translate
 * @param targetCode Target language code (e.g., "nung")
 * @returns TieredTranslationResult with breakdown of sources
 */
export async function smartTranslateText(
  text: string,
  targetCode: string = "nung"
): Promise<TieredTranslationResult> {
  const startTime = performance.now();

  // Stats tracking
  let localHits = 0;
  let dbHits = 0;
  let inferredCount = 0;
  let apiCalls = 0;
  let unknownCount = 0;

  const breakdown: WordBreakdown[] = [];

  // Get approved contributions from DB (cached)
  let approvedMap: Map<string, ContributedWord> = new Map();
  try {
    approvedMap = await getApprovedContributionsMap();
  } catch (err) {
    console.warn("[TieredTranslation] Could not fetch DB contributions:", err);
  }

  // ===== BƯỚC 1: Sử dụng smartLookup để tìm cụm từ + suy luận =====
  const lookupResult = smartLookup(text);

  console.log("[TieredTranslation] smartLookup result:", {
    directMatches: lookupResult.directMatches.length,
    inferredMatches: lookupResult.inferredMatches.length,
    notFound: lookupResult.notFound,
  });

  // ===== BƯỚC 2: Xử lý kết quả trực tiếp (cụm từ + từ đơn trong dictionary) =====
  for (const match of lookupResult.directMatches) {
    breakdown.push({
      word: match.word,
      translation: getFirstTranslation(match.entry.script),
      source: "local",
      confidence: "high",
      notes: match.entry.notes,
      category: match.entry.category,
    });
    localHits++;
  }

  // ===== BƯỚC 3: Xử lý từ được suy luận =====
  for (const inferred of lookupResult.inferredMatches) {
    breakdown.push({
      word: inferred.word,
      translation: inferred.script,
      source: "inferred",
      confidence: inferred.confidence,
      notes: inferred.reasoning,
    });
    inferredCount++;
  }

  // ===== BƯỚC 4: Kiểm tra DB contributions cho từ không tìm thấy =====
  const stillMissing: string[] = [];

  for (const word of lookupResult.notFound) {
    // Kiểm tra DB contributions
    const dbEntry = approvedMap.get(word.toLowerCase());
    if (dbEntry) {
      breakdown.push({
        word,
        translation: getFirstTranslation(dbEntry.script),
        source: "db",
        confidence: "high",
        notes: dbEntry.notes,
        category: dbEntry.category,
      });
      dbHits++;
    } else {
      stillMissing.push(word);
    }
  }

  // ===== BƯỚC 5: Gọi API cho từ thực sự không tìm thấy (với fallback) =====
  if (stillMissing.length > 0) {
    console.log(
      `[TieredTranslation] ${stillMissing.length} words need API lookup:`,
      stillMissing
    );

    try {
      const apiResults = await translateMissingWords(stillMissing, targetCode);

      for (const word of stillMissing) {
        if (apiResults.has(word)) {
          const translation = apiResults.get(word)!;
          breakdown.push({
            word,
            translation,
            source: "api",
            confidence: "medium",
            notes: "Dịch bởi AI - cần xác nhận",
          });
          apiCalls++;

          // Save to DB for future use (non-blocking)
          saveApiDiscoveredWord(word, translation, targetCode).catch((err) => {
            console.warn(`[TieredTranslation] Failed to save "${word}":`, err);
          });
        } else {
          // API didn't return this word - mark as unknown
          breakdown.push({
            word,
            translation: `[${word}]`,
            source: "unknown",
          });
          unknownCount++;
        }
      }
    } catch (err) {
      // API failed (CORS, network, etc.) - fallback to marking as unknown
      console.warn(
        "[TieredTranslation] API call failed, using local only:",
        err
      );

      for (const word of stillMissing) {
        breakdown.push({
          word,
          translation: `[${word}]`,
          source: "unknown",
          notes: "API không khả dụng - cần thêm vào từ điển",
        });
        unknownCount++;
      }
    }
  }

  // ===== BƯỚC 6: Sắp xếp breakdown theo thứ tự xuất hiện trong văn bản gốc =====
  let sortedBreakdown = sortBreakdownByOriginalOrder(text, breakdown);

  // ===== BƯỚC 6.5: Áp dụng quy tắc ghép từ (Composition Rules) =====
  // Ví dụ: [classifier] + [noun] -> "tua" + "ma" = "tua ma"
  sortedBreakdown = composeBreakdown(sortedBreakdown);

  // ===== BƯỚC 7: Ghép kết quả =====
  const translation = sortedBreakdown.map((item) => item.translation).join(" ");

  const endTime = performance.now();

  return {
    original: text,
    translation,
    breakdown: sortedBreakdown,
    stats: {
      totalWords:
        lookupResult.directMatches.length +
        lookupResult.inferredMatches.length +
        lookupResult.notFound.length,
      localHits,
      dbHits,
      inferred: inferredCount,
      apiCalls,
      unknown: unknownCount,
    },
    apiCalled: stillMissing.length > 0,
    timeTaken: Math.round(endTime - startTime),
  };
}

// ==================== Helper Functions ====================

/**
 * Get the first translation variant from a script string
 * e.g., "khỏi / khọi" -> "khỏi"
 */
function getFirstTranslation(script: string): string {
  const variants = script.split("/");
  return variants[0].trim();
}

/**
 * Sort breakdown items by their order of appearance in original text
 */
function sortBreakdownByOriginalOrder(
  originalText: string,
  breakdown: WordBreakdown[]
): WordBreakdown[] {
  const lowerText = originalText.toLowerCase();

  return breakdown.sort((a, b) => {
    const indexA = lowerText.indexOf(a.word.toLowerCase());
    const indexB = lowerText.indexOf(b.word.toLowerCase());
    return indexA - indexB;
  });
}

/**
 * Ghép các từ đơn lẻ thành cụm từ theo quy tắc ngữ pháp Nùng
 * Hiện tại hỗ trợ: Classifier + Noun (ví dụ: con + chó -> tua ma)
 */
function composeBreakdown(items: WordBreakdown[]): WordBreakdown[] {
  if (items.length < 2) return items;

  const result: WordBreakdown[] = [];

  for (let i = 0; i < items.length; i++) {
    const current = items[i];
    const next = items[i + 1];

    // Quy tắc 1: Classifier + Noun (con + chó, cái + bàn, ...)
    if (
      next &&
      current.category === "classifier" &&
      (next.category === "noun" || !next.category)
    ) {
      result.push({
        word: `${current.word} ${next.word}`,
        translation: `${current.translation} ${next.translation}`,
        source:
          current.source === "local" && next.source === "local"
            ? "local"
            : "inferred",
        confidence: "high",
        category: "noun",
        notes: `Ghép từ tự động: ${current.category} + ${
          next.category || "unknown"
        }`,
      });
      i++; // Bỏ qua từ tiếp theo vì đã ghép
    } else {
      result.push(current);
    }
  }

  return result;
}

/**
 * Check if text can be translated entirely from local sources
 * Useful for quick preview before full translation
 */
export async function canTranslateLocally(text: string): Promise<{
  canTranslate: boolean;
  coverage: number;
  missingWords: string[];
}> {
  const lookupResult = smartLookup(text);
  const approvedMap = await getApprovedContributionsMap();

  // Check DB for notFound words
  const stillMissing = lookupResult.notFound.filter(
    (word) => !approvedMap.has(word.toLowerCase())
  );

  const totalFound =
    lookupResult.directMatches.length +
    lookupResult.inferredMatches.length +
    (lookupResult.notFound.length - stillMissing.length);

  const totalWords =
    lookupResult.directMatches.length +
    lookupResult.inferredMatches.length +
    lookupResult.notFound.length;

  const coverage = totalWords > 0 ? (totalFound / totalWords) * 100 : 100;

  return {
    canTranslate: stillMissing.length === 0,
    coverage: Math.round(coverage),
    missingWords: stillMissing,
  };
}

/**
 * Get translation stats for a text without actually translating
 */
export function getTranslationPreview(text: string): {
  phrases: string[];
  singleWords: string[];
  inferred: string[];
  needsLookup: string[];
} {
  const lookupResult = smartLookup(text);

  // Separate phrases from single words in directMatches
  const phrases = lookupResult.directMatches
    .filter((m) => m.word.includes(" "))
    .map((m) => m.word);

  const singleWords = lookupResult.directMatches
    .filter((m) => !m.word.includes(" "))
    .map((m) => m.word);

  return {
    phrases,
    singleWords,
    inferred: lookupResult.inferredMatches.map((i) => i.word),
    needsLookup: lookupResult.notFound,
  };
}
