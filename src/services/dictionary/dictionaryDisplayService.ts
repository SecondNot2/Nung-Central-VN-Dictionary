/**
 * Service để chuyển đổi dữ liệu từ NUNG_DICTIONARY sang format hiển thị
 */

import { NUNG_DICTIONARY, type NungWord } from "../../data";

// Format cho hiển thị trong DictionaryList và AdminDictionary
export interface DictionaryEntry {
  id: string;
  word: string; // Tiếng Việt
  translation: string; // Tiếng Nùng (script)
  phonetic: string;
  language: "nung" | "central";
  example?: string;
  notes?: string;
  status: "approved" | "pending" | "rejected";
  createdAt: string;
  updatedAt?: string;
}

/**
 * Chuyển đổi NUNG_DICTIONARY thành mảng DictionaryEntry
 */
export function getDictionaryEntries(): DictionaryEntry[] {
  const entries: DictionaryEntry[] = [];

  for (const [vietnamese, nungWord] of Object.entries(NUNG_DICTIONARY)) {
    entries.push({
      id: `nung_${vietnamese.replace(/\s+/g, "_")}`,
      word: vietnamese,
      translation: nungWord.script,
      phonetic: nungWord.phonetic || nungWord.script.split("/")[0].trim(),
      language: "nung",
      notes: nungWord.notes,
      status: "approved", // Tất cả từ trong NUNG_DICTIONARY đều được duyệt
      createdAt: "2024-01-01", // Data gốc
    });
  }

  // Sắp xếp theo từ tiếng Việt
  entries.sort((a, b) => a.word.localeCompare(b.word, "vi"));

  return entries;
}

/**
 * Lấy tổng số từ
 */
export function getDictionaryStats() {
  const entries = getDictionaryEntries();
  return {
    total: entries.length,
    nung: entries.filter((e) => e.language === "nung").length,
    central: entries.filter((e) => e.language === "central").length,
    approved: entries.filter((e) => e.status === "approved").length,
    pending: entries.filter((e) => e.status === "pending").length,
    rejected: entries.filter((e) => e.status === "rejected").length,
  };
}

/**
 * Tìm kiếm trong từ điển
 */
export function searchDictionary(
  query: string,
  language?: "nung" | "central" | "all"
): DictionaryEntry[] {
  const entries = getDictionaryEntries();
  const lowerQuery = query.toLowerCase().trim();

  return entries.filter((entry) => {
    const matchesSearch =
      !lowerQuery ||
      entry.word.toLowerCase().includes(lowerQuery) ||
      entry.translation.toLowerCase().includes(lowerQuery) ||
      entry.phonetic.toLowerCase().includes(lowerQuery);

    const matchesLanguage =
      !language || language === "all" || entry.language === language;

    return matchesSearch && matchesLanguage;
  });
}
