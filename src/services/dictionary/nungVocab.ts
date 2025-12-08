import { NUNG_DICTIONARY, type NungWord } from "../../data";

// Re-export for backward compatibility
export type { NungWord };

/**
 * Hàm suy luận từ vựng thông minh
 * Khi một từ không có trong từ điển, hệ thống sẽ cố gắng suy luận từ các cụm từ đã có
 * Ví dụ: "đi ngủ" = "pây noòn" và "đi" = "pây" → suy ra "ngủ" = "noòn"
 */
export interface InferredWord {
  word: string;
  script: string;
  confidence: "high" | "medium" | "low";
  source: string; // Cụm từ gốc dùng để suy luận
  reasoning: string; // Giải thích cách suy luận
}

/**
 * Tìm từ trong từ điển hoặc suy luận từ các cụm từ
 */
export function lookupWord(word: string): NungWord | InferredWord | null {
  const normalizedWord = word.toLowerCase().trim();

  // 1. Tìm trực tiếp trong từ điển
  if (NUNG_DICTIONARY[normalizedWord]) {
    return NUNG_DICTIONARY[normalizedWord];
  }

  // 2. Thử suy luận từ các cụm từ
  const inferred = inferWordFromPhrases(normalizedWord);
  if (inferred) {
    return inferred;
  }

  return null;
}

/**
 * Suy luận từ đơn từ các cụm từ trong từ điển
 */
export function inferWordFromPhrases(targetWord: string): InferredWord | null {
  const normalizedTarget = targetWord.toLowerCase().trim();
  const inferredResults: InferredWord[] = [];

  // Duyệt qua tất cả các cụm từ trong từ điển
  for (const [phrase, entry] of Object.entries(NUNG_DICTIONARY)) {
    const phraseWords = phrase.toLowerCase().split(/\s+/);
    const scriptWords = entry.script.toLowerCase().split(/\s+/);

    // Chỉ xử lý các cụm từ có 2+ từ và số từ tương đương
    if (phraseWords.length < 2) continue;

    // Kiểm tra xem targetWord có trong cụm từ không
    const targetIndex = phraseWords.indexOf(normalizedTarget);
    if (targetIndex === -1) continue;

    // Thử suy luận từ vị trí tương ứng
    const result = tryInferFromPhrase(
      normalizedTarget,
      phraseWords,
      scriptWords,
      targetIndex,
      phrase,
      entry.script
    );

    if (result) {
      inferredResults.push(result);
    }
  }

  // Chọn kết quả tốt nhất (ưu tiên confidence cao và nhiều nguồn xác nhận)
  if (inferredResults.length > 0) {
    // Nhóm theo script để tìm từ được xác nhận nhiều lần
    const scriptCounts = new Map<string, InferredWord[]>();
    for (const result of inferredResults) {
      const key = result.script.toLowerCase();
      if (!scriptCounts.has(key)) {
        scriptCounts.set(key, []);
      }
      scriptCounts.get(key)!.push(result);
    }

    // Tìm script được xác nhận nhiều nhất
    let bestScript = "";
    let maxCount = 0;
    for (const [script, results] of scriptCounts.entries()) {
      if (results.length > maxCount) {
        maxCount = results.length;
        bestScript = script;
      }
    }

    const bestResults = scriptCounts.get(bestScript)!;
    const sources = bestResults
      .map((r) => r.source)
      .slice(0, 3)
      .join("; ");

    // Xác định confidence dựa trên số lượng nguồn xác nhận
    let confidence: "high" | "medium" | "low" = "low";
    if (bestResults.length >= 3) {
      confidence = "high";
    } else if (bestResults.length >= 2) {
      confidence = "medium";
    }

    return {
      word: normalizedTarget,
      script: bestResults[0].script,
      confidence,
      source: sources,
      reasoning: `Suy luận từ ${bestResults.length} cụm từ: ${sources}`,
    };
  }

  return null;
}

/**
 * Thử suy luận từ một cụm từ cụ thể
 */
function tryInferFromPhrase(
  targetWord: string,
  phraseWords: string[],
  scriptWords: string[],
  targetIndex: number,
  originalPhrase: string,
  originalScript: string
): InferredWord | null {
  // Xử lý trường hợp script có "/" (nhiều biến thể)
  const scriptVariants = originalScript.split("/").map((s) => s.trim());

  for (const scriptVariant of scriptVariants) {
    const variantWords = scriptVariant.toLowerCase().split(/\s+/);

    // Nếu số từ khớp, lấy từ ở vị trí tương ứng
    if (variantWords.length === phraseWords.length) {
      const inferredScript = variantWords[targetIndex];

      // Kiểm tra xem các từ khác có khớp với từ điển không
      let matchCount = 0;
      for (let i = 0; i < phraseWords.length; i++) {
        if (i === targetIndex) continue;
        const dictEntry = NUNG_DICTIONARY[phraseWords[i]];
        if (dictEntry) {
          const dictScripts = dictEntry.script.toLowerCase().split(/[\/\s,]+/);
          if (dictScripts.some((s) => s.trim() === variantWords[i])) {
            matchCount++;
          }
        }
      }

      if (inferredScript && inferredScript.length > 0) {
        return {
          word: targetWord,
          script: inferredScript,
          confidence: matchCount > 0 ? "medium" : "low",
          source: `"${originalPhrase}" → "${scriptVariant}"`,
          reasoning: `Từ "${targetWord}" ở vị trí ${
            targetIndex + 1
          } trong cụm từ`,
        };
      }
    }
  }

  return null;
}

/**
 * Tra cứu nâng cao: tìm từ trực tiếp hoặc suy luận, trả về đầy đủ thông tin
 */
export function smartLookup(text: string): {
  directMatches: { word: string; entry: NungWord }[];
  inferredMatches: InferredWord[];
  notFound: string[];
} {
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const directMatches: { word: string; entry: NungWord }[] = [];
  const inferredMatches: InferredWord[] = [];
  const notFound: string[] = [];

  // Kiểm tra cụm từ trước (ưu tiên cụm từ dài hơn)
  const sortedPhrases = Object.keys(NUNG_DICTIONARY).sort(
    (a, b) => b.length - a.length
  );
  const processedIndices = new Set<number>();

  const lowerText = text.toLowerCase();
  for (const phrase of sortedPhrases) {
    if (lowerText.includes(phrase)) {
      directMatches.push({
        word: phrase,
        entry: NUNG_DICTIONARY[phrase],
      });
      // Đánh dấu các từ trong cụm từ đã được xử lý
      const phraseWords = phrase.split(/\s+/);
      for (const pw of phraseWords) {
        const idx = words.indexOf(pw);
        if (idx !== -1) processedIndices.add(idx);
      }
    }
  }

  // Kiểm tra từng từ đơn chưa được xử lý
  for (let i = 0; i < words.length; i++) {
    if (processedIndices.has(i)) continue;

    const word = words[i];

    // Tìm trực tiếp
    if (NUNG_DICTIONARY[word]) {
      directMatches.push({
        word,
        entry: NUNG_DICTIONARY[word],
      });
      continue;
    }

    // Thử suy luận
    const inferred = inferWordFromPhrases(word);
    if (inferred) {
      inferredMatches.push(inferred);
      continue;
    }

    notFound.push(word);
  }

  return { directMatches, inferredMatches, notFound };
}

/**
 * Xây dựng từ vựng được suy luận từ toàn bộ từ điển
 * Trả về map các từ đơn có thể suy luận được
 */
export function buildInferredVocabulary(): Map<string, InferredWord> {
  const inferredVocab = new Map<string, InferredWord>();
  const allWords = new Set<string>();

  // Thu thập tất cả các từ đơn từ các cụm từ
  for (const phrase of Object.keys(NUNG_DICTIONARY)) {
    const words = phrase.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 1 && !NUNG_DICTIONARY[word]) {
        allWords.add(word);
      }
    }
  }

  // Thử suy luận từng từ
  for (const word of allWords) {
    const inferred = inferWordFromPhrases(word);
    if (inferred && inferred.confidence !== "low") {
      inferredVocab.set(word, inferred);
    }
  }

  return inferredVocab;
}

// ====== REVERSE LOOKUP: NUNG → VIETNAMESE ======

export interface ReverseNungEntry {
  vietnamese: string;
  phonetic: string;
  notes?: string;
  originalScript: string; // Bản gốc tiếng Nùng (có thể có nhiều biến thể)
}

/**
 * Từ điển ngược: Tiếng Nùng → Tiếng Việt
 * Được xây dựng tự động từ NUNG_DICTIONARY
 */
let _reverseNungDictionary: Map<string, ReverseNungEntry[]> | null = null;

/**
 * Xây dựng từ điển ngược từ NUNG_DICTIONARY
 * Mỗi từ tiếng Nùng có thể map đến nhiều từ tiếng Việt khác nhau
 */
function buildReverseDictionary(): Map<string, ReverseNungEntry[]> {
  const reverseDict = new Map<string, ReverseNungEntry[]>();

  for (const [vietnamese, entry] of Object.entries(NUNG_DICTIONARY)) {
    // Tách các biến thể tiếng Nùng (phân cách bởi / hoặc ,)
    const nungVariants = entry.script
      .split(/[\/,]/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0);

    for (const nungWord of nungVariants) {
      // Chuẩn hóa: bỏ dấu cách thừa
      const normalizedNung = nungWord.replace(/\s+/g, " ").trim();

      if (!normalizedNung) continue;

      const reverseEntry: ReverseNungEntry = {
        vietnamese,
        phonetic: entry.phonetic || "",
        notes: entry.notes,
        originalScript: entry.script,
      };

      if (reverseDict.has(normalizedNung)) {
        reverseDict.get(normalizedNung)!.push(reverseEntry);
      } else {
        reverseDict.set(normalizedNung, [reverseEntry]);
      }
    }
  }

  return reverseDict;
}

/**
 * Lấy từ điển ngược (lazy initialization)
 */
export function getReverseDictionary(): Map<string, ReverseNungEntry[]> {
  if (!_reverseNungDictionary) {
    _reverseNungDictionary = buildReverseDictionary();
  }
  return _reverseNungDictionary;
}

/**
 * Tra cứu ngược: Tiếng Nùng → Tiếng Việt
 * @param nungText Văn bản tiếng Nùng cần tra cứu
 * @returns Object chứa kết quả tra cứu
 */
export function reverseNungLookup(nungText: string): {
  directMatches: { nungWord: string; entries: ReverseNungEntry[] }[];
  partialMatches: { nungWord: string; entries: ReverseNungEntry[] }[];
  notFound: string[];
} {
  const reverseDict = getReverseDictionary();
  const words = nungText
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0);

  const directMatches: { nungWord: string; entries: ReverseNungEntry[] }[] = [];
  const partialMatches: { nungWord: string; entries: ReverseNungEntry[] }[] =
    [];
  const notFound: string[] = [];
  const processedIndices = new Set<number>();

  // Tạo text đầy đủ để tìm cụm từ
  const fullText = nungText.toLowerCase();

  // Tìm các cụm từ (ưu tiên cụm dài hơn)
  const allNungKeys = Array.from(reverseDict.keys()).sort(
    (a, b) => b.length - a.length
  );

  for (const nungPhrase of allNungKeys) {
    if (nungPhrase.includes(" ") && fullText.includes(nungPhrase)) {
      directMatches.push({
        nungWord: nungPhrase,
        entries: reverseDict.get(nungPhrase)!,
      });
      // Đánh dấu các từ trong cụm đã xử lý
      const phraseWords = nungPhrase.split(/\s+/);
      for (const pw of phraseWords) {
        const idx = words.indexOf(pw);
        if (idx !== -1) processedIndices.add(idx);
      }
    }
  }

  // Tìm từng từ đơn chưa được xử lý
  for (let i = 0; i < words.length; i++) {
    if (processedIndices.has(i)) continue;

    const word = words[i];

    // Tìm khớp chính xác
    if (reverseDict.has(word)) {
      directMatches.push({
        nungWord: word,
        entries: reverseDict.get(word)!,
      });
      continue;
    }

    // Tìm khớp một phần (từ chứa trong key hoặc key chứa từ)
    let found = false;
    for (const [nungKey, entries] of reverseDict.entries()) {
      if (nungKey.includes(word) || word.includes(nungKey)) {
        partialMatches.push({
          nungWord: nungKey,
          entries,
        });
        found = true;
        break;
      }
    }

    if (!found) {
      notFound.push(word);
    }
  }

  return { directMatches, partialMatches, notFound };
}

/**
 * Lấy tất cả các cách dịch tiếng Việt từ một từ/cụm từ tiếng Nùng
 * @param nungWord Từ tiếng Nùng
 * @returns Mảng các từ tiếng Việt tương ứng
 */
export function getVietnameseTranslations(nungWord: string): string[] {
  const reverseDict = getReverseDictionary();
  const normalizedWord = nungWord.toLowerCase().trim();

  const entries = reverseDict.get(normalizedWord);
  if (entries) {
    return entries.map((e) => e.vietnamese);
  }

  return [];
}

/**
 * Tra cứu nâng cao ngược: tìm từ tiếng Việt từ tiếng Nùng với context
 */
export function smartReverseLookup(nungText: string): string {
  const result = reverseNungLookup(nungText);
  const translations: string[] = [];

  // Thêm kết quả trực tiếp
  for (const match of result.directMatches) {
    const viWords = match.entries.map((e) => e.vietnamese);
    translations.push(`${match.nungWord} → ${viWords.join(" / ")}`);
  }

  // Thêm kết quả khớp một phần
  for (const match of result.partialMatches) {
    const viWords = match.entries.map((e) => e.vietnamese);
    translations.push(`(${match.nungWord} ≈ ${viWords.join(" / ")})`);
  }

  // Thêm các từ không tìm thấy
  if (result.notFound.length > 0) {
    translations.push(`[Không tìm thấy: ${result.notFound.join(", ")}]`);
  }

  return translations.join("\n");
}

// ==================== Combined Lookup with Approved Contributions ====================

import { getApprovedContributionsMap } from "../dictionary/approvedVocabService";

/**
 * Combined lookup that searches both static dictionary and approved contributions
 * Returns NungWord from either source, with approved contributions taking precedence
 */
export async function lookupWordCombined(
  word: string
): Promise<NungWord | InferredWord | null> {
  const normalizedWord = word.toLowerCase().trim();

  // 1. Try approved contributions first (async)
  try {
    const approvedMap = await getApprovedContributionsMap();
    const contribution = approvedMap.get(normalizedWord);
    if (contribution) {
      return contribution;
    }
  } catch (err) {
    console.error("Error checking approved contributions:", err);
  }

  // 2. Fall back to static dictionary
  if (NUNG_DICTIONARY[normalizedWord]) {
    return NUNG_DICTIONARY[normalizedWord];
  }

  // 3. Try inference
  const inferred = inferWordFromPhrases(normalizedWord);
  if (inferred) {
    return inferred;
  }

  return null;
}

/**
 * Get combined dictionary count (static + approved contributions)
 */
export async function getCombinedDictionaryCount(): Promise<{
  static: number;
  approved: number;
  total: number;
}> {
  const staticCount = Object.keys(NUNG_DICTIONARY).length;

  try {
    const approvedMap = await getApprovedContributionsMap();
    const approvedCount = approvedMap.size;
    return {
      static: staticCount,
      approved: approvedCount,
      total: staticCount + approvedCount,
    };
  } catch {
    return {
      static: staticCount,
      approved: 0,
      total: staticCount,
    };
  }
}
