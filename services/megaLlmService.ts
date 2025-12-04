import { TranslationResult } from "../types";
import { callMegaLLM, cleanJsonResponse, type LLMMessage } from "./llmClient";
import {
  getLanguageDescription,
  getTranslationRules,
  SYSTEM_PROMPT_TRANSLATION,
  SYSTEM_PROMPT_CHAT,
  buildTranslationPrompt,
  buildSpellCheckPrompt,
} from "./translationRules";
import { speakWithBrowserTTS, isBrowserTTSAvailable } from "./ttsHelper";

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
