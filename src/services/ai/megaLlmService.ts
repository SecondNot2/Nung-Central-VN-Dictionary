import { TranslationResult } from "../../types";
import {
  callMegaLLM,
  cleanJsonResponse,
  type LLMMessage,
} from "../ai/llmClient";
import {
  getLanguageDescription,
  getTranslationRules,
  SYSTEM_PROMPT_TRANSLATION,
  SYSTEM_PROMPT_CHAT,
  buildTranslationPrompt,
  buildSpellCheckPrompt,
} from "../dictionary/translationRules";
import { speakWithBrowserTTS, isBrowserTTSAvailable } from "../utils/ttsHelper";

/**
 * Translates text using MegaLLM API
 */
export const translateText = async (
  text: string,
  targetCode: string,
  sourceCode: string = "vi"
): Promise<TranslationResult> => {
  // Use shared language descriptions and translation rules
  const sourceLangDesc = getLanguageDescription(sourceCode);
  const { targetLangDesc, specificRules } = getTranslationRules(
    text,
    sourceCode,
    targetCode
  );

  const prompt = buildTranslationPrompt(
    text,
    sourceLangDesc,
    targetLangDesc,
    specificRules
  );

  try {
    const responseText = await callMegaLLM(
      [
        { role: "system", content: SYSTEM_PROMPT_TRANSLATION },
        { role: "user", content: prompt },
      ],
      { temperature: 0.4 }
    );

    // Use shared JSON cleanup utility
    const cleanJson = cleanJsonResponse(responseText);
    const data = JSON.parse(cleanJson);

    return {
      original: text,
      translations: data.translations || [],
      definitions: data.definitions || [],
      culturalNote: data.culturalNote,
    };
  } catch (error) {
    console.error("Translation Error:", error);
    throw new Error("Lỗi khi dịch thuật.");
  }
};

/**
 * Check spelling and suggest corrections
 */
export const checkSpelling = async (text: string): Promise<string | null> => {
  if (!text || text.length < 3) return null;

  const prompt = buildSpellCheckPrompt(text);

  try {
    const suggestion = await callMegaLLM([{ role: "user", content: prompt }], {
      temperature: 0.3,
    });

    const cleanSuggestion = suggestion.trim();
    if (
      cleanSuggestion === "NULL" ||
      cleanSuggestion.toLowerCase() === text.toLowerCase()
    ) {
      return null;
    }
    return cleanSuggestion;
  } catch (error) {
    console.error("Spell Check Error:", error);
    return null;
  }
};

/**
 * Analyze image using MegaLLM API
 */
export const analyzeImage = async (
  base64Image: string,
  mimeType: string
): Promise<string> => {
  try {
    // MegaLLM's vision models might have different names
    // For now, we'll use text-only approach or return a message
    const response = await callMegaLLM(
      [
        {
          role: "user",
          content:
            "Xin lỗi, phân tích hình ảnh chưa được hỗ trợ với MegaLLM API trong phiên bản này.",
        },
      ],
      {}
    );
    return response;
  } catch (error) {
    console.error("Image Analysis Error:", error);
    return "Lỗi khi phân tích hình ảnh.";
  }
};

/**
 * Generate Speech using browser TTS
 */
export const generateSpeech = async (
  text: string,
  voice: string = "Kore"
): Promise<void> => {
  try {
    // MegaLLM doesn't support TTS, use browser TTS via shared helper
    if (isBrowserTTSAvailable()) {
      await speakWithBrowserTTS(text, { lang: "vi-VN" });
    } else {
      throw new Error("Browser TTS not supported");
    }
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};

/**
 * Chat with MegaLLM
 */
export const sendChatMessage = async (
  history: { role: string; text: string }[],
  newMessage: string
) => {
  // Convert history to MegaLLM format
  const messages: LLMMessage[] = [
    {
      role: "system",
      content: SYSTEM_PROMPT_CHAT,
    },
    ...history.map((msg) => ({
      role: (msg.role === "assistant" || msg.role === "model"
        ? "assistant"
        : "user") as "system" | "user" | "assistant",
      content: msg.text,
    })),
    { role: "user" as const, content: newMessage },
  ];

  try {
    const response = await callMegaLLM(messages, { temperature: 0.8 });
    return response;
  } catch (error) {
    console.error("Chat Error:", error);
    return "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại.";
  }
};

// ==================== Tiered Translation Support ====================

import { supabase, isSupabaseConfigured } from "../api/supabaseClient";

/**
 * Translate an array of individual words (not full sentences)
 * Used by tieredTranslationService for words not found in local/DB
 * @param words Array of Vietnamese words to translate
 * @param targetCode Target language code (e.g., "nung")
 * @returns Map of word -> translation
 */
export const translateMissingWords = async (
  words: string[],
  targetCode: string
): Promise<Map<string, string>> => {
  if (words.length === 0) {
    return new Map();
  }

  const { targetLangDesc } = getTranslationRules("", "vi", targetCode);
  const wordListStr = words.join(", ");

  const prompt = `
Bạn là chuyên gia ngôn ngữ Tày-Nùng. Nhiệm vụ: Dịch từng TỪ TIẾNG VIỆT sau sang ${targetLangDesc}.

DANH SÁCH TỪ CẦN DỊCH: ${wordListStr}

YÊU CẦU:
1. Dịch TỪNG TỪ RIÊNG LẺ, không phải cả câu
2. Nếu không biết từ nào, ghi "[không rõ]"
3. Ưu tiên phương ngữ Lạng Sơn nếu có nhiều biến thể

OUTPUT: Trả về JSON object với format:
{
  "translations": {
    "từ_tiếng_việt_1": "bản_dịch_1",
    "từ_tiếng_việt_2": "bản_dịch_2"
  }
}

Chỉ trả về JSON, không giải thích.
  `;

  try {
    const responseText = await callMegaLLM(
      [
        { role: "system", content: SYSTEM_PROMPT_TRANSLATION },
        { role: "user", content: prompt },
      ],
      { temperature: 0.3 }
    );

    const cleanJson = cleanJsonResponse(responseText);
    const data = JSON.parse(cleanJson);

    const result = new Map<string, string>();

    if (data.translations && typeof data.translations === "object") {
      for (const [word, translation] of Object.entries(data.translations)) {
        if (typeof translation === "string" && translation !== "[không rõ]") {
          result.set(word.toLowerCase(), translation);
        }
      }
    }

    console.log(
      `[translateMissingWords] Translated ${result.size}/${words.length} words via MegaLLM`
    );
    return result;
  } catch (error) {
    console.error("[translateMissingWords] Error:", error);
    return new Map();
  }
};

/**
 * Save a word discovered via API translation to the contributions table
 * Status is set to "pending" for admin review
 * @param word Vietnamese word
 * @param translation Translation from API
 * @param targetLang Target language code
 */
export const saveApiDiscoveredWord = async (
  word: string,
  translation: string,
  targetLang: string
): Promise<void> => {
  if (!isSupabaseConfigured()) {
    console.log(
      "[saveApiDiscoveredWord] Supabase not configured, skipping save"
    );
    return;
  }

  try {
    // Check if word already exists
    const { data: existing } = await supabase
      .from("contributions")
      .select("id")
      .eq("word", word.toLowerCase())
      .eq("target_lang", targetLang)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(
        `[saveApiDiscoveredWord] Word "${word}" already exists, skipping`
      );
      return;
    }

    // Insert new contribution with pending status
    const { error } = await supabase.from("contributions").insert({
      word: word.toLowerCase(),
      translation,
      source_lang: "vi",
      target_lang: targetLang,
      phonetic: null,
      region: "API Discovery",
      example: null,
      meaning: `Tự động phát hiện qua API - cần xác nhận`,
      status: "pending",
    });

    if (error) {
      throw error;
    }

    console.log(
      `[saveApiDiscoveredWord] Saved "${word}" -> "${translation}" for review`
    );
  } catch (err) {
    console.error("[saveApiDiscoveredWord] Error saving word:", err);
    throw err;
  }
};
