import { TranslationResult } from "../../types";
import {
  callRouterChat,
  callRouterPrompt,
  cleanJsonResponse,
  type RouterMessage,
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
import { supabase, isSupabaseConfigured } from "../api/supabaseClient";

/**
 * Translates text using 9Router
 */
export const translateText = async (
  text: string,
  targetCode: string,
  sourceCode: string = "vi"
): Promise<TranslationResult> => {
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
    const responseText = await callRouterChat(
      [
        { role: "system", content: SYSTEM_PROMPT_TRANSLATION },
        { role: "user", content: prompt },
      ],
      { temperature: 0.4 }
    );

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
    const suggestion = await callRouterChat([{ role: "user", content: prompt }], {
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
 * Analyze image using 9Router vision/chat endpoint
 */
export const analyzeImage = async (
  base64Image: string,
  mimeType: string
): Promise<string> => {
  try {
    const response = await callRouterPrompt({
      prompt:
        "Bạn là nhà nghiên cứu văn hóa Việt Nam. Phân tích hình ảnh, dịch chữ nếu có và mô tả ngắn gọn theo tiếng Việt.",
      image: { base64: base64Image, mimeType },
      temperature: 0.3,
    });
    return response || "Không thể phân tích hình ảnh.";
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
    void voice;
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
 * Chat with 9Router
 */
export const sendChatMessage = async (
  history: { role: string; text: string }[],
  newMessage: string
) => {
  const messages: RouterMessage[] = [
    {
      role: "system",
      content: SYSTEM_PROMPT_CHAT,
    },
    ...history.map((msg) => ({
      role: (msg.role === "assistant" || msg.role === "model"
        ? "assistant"
        : "user") as RouterMessage["role"],
      content: msg.text,
    })),
    { role: "user", content: newMessage },
  ];

  try {
    const response = await callRouterChat(messages, { temperature: 0.8 });
    return response;
  } catch (error) {
    console.error("Chat Error:", error);
    return "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại.";
  }
};

/**
 * Translate an array of individual words (not full sentences)
 * Used by tieredTranslationService for words not found in local/DB
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
    const responseText = await callRouterChat(
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
      `[translateMissingWords] Translated ${result.size}/${words.length} words via 9Router`
    );
    return result;
  } catch (error) {
    console.error("[translateMissingWords] Error:", error);
    return new Map();
  }
};

/**
 * Save a word discovered via API translation to the contributions table
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

    const { error } = await supabase.from("contributions").insert({
      word: word.toLowerCase(),
      translation,
      source_lang: "vi",
      target_lang: targetLang,
      phonetic: null,
      region: "API Discovery",
      example: null,
      meaning: "Tự động phát hiện qua 9Router - cần xác nhận",
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
