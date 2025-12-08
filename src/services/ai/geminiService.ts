import { GoogleGenerativeAI } from "@google/generative-ai";
import { TranslationResult } from "../../types";
import { decodeBase64, decodeAudioData } from "../utils/audioHelpers";
import { speakWithBrowserTTS, isBrowserTTSAvailable } from "../utils/ttsHelper";
import { cleanJsonResponse } from "../ai/llmClient";
import {
  getLanguageDescription,
  getTranslationRules,
} from "../dictionary/translationRules";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

// --- Service Functions ---

/**
 * Translates text using Gemini 3 Pro
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

  const prompt = `
    Bạn là chuyên gia ngôn ngữ học Việt Nam. Nhiệm vụ: Dịch văn bản từ ${sourceLangDesc} sang ${targetLangDesc}.
    ${specificRules}
    
    YÊU CẦU OUTPUT: Trả về duy nhất 1 JSON object (không markdown, không giải thích thêm) theo định dạng:
    {
      "translations": [
        { "language": "Tên ngôn ngữ đích", "script": "Văn bản dịch", "phonetic": "Phiên âm cách đọc (nếu cần thiết, đặc biệt cho tiếng Nùng)" }
      ],
      "definitions": [
        { "word": "Từ vựng quan trọng", "definition": "Nghĩa chi tiết", "example": "Ví dụ minh họa" }
      ],
      "culturalNote": "Ghi chú văn hóa ngắn gọn (nếu có)"
    }
    
    Câu cần dịch: "${text}"
  `;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    const response = await model.generateContent(prompt);

    const jsonText = response.response.text() || "{}";
    // Use shared JSON cleanup utility
    const cleanJson = cleanJsonResponse(jsonText);
    const data = JSON.parse(cleanJson);

    return {
      original: text,
      translations: data.translations || [],
      definitions: data.definitions || [],
      culturalNote: data.culturalNote,
    };
  } catch (error) {
    console.error("Translation Error:", error);
    throw new Error("Lỗi khi dịch thuật với Gemini.");
  }
};

/**
 * Check spelling and suggest corrections
 */
export const checkSpelling = async (text: string): Promise<string | null> => {
  if (!text || text.length < 3) return null;

  const prompt = `
    Bạn là công cụ kiểm tra chính tả Tiếng Việt.
    Nhiệm vụ: Kiểm tra xem văn bản sau có lỗi chính tả không.
    Nếu có lỗi, hãy đưa ra CÂU ĐÚNG gợi ý.
    Nếu không có lỗi, trả về "NULL".
    
    Văn bản: "${text}"
    
    Chỉ trả về văn bản gợi ý hoặc "NULL". Không giải thích.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const suggestion = result.response.text().trim();

    if (
      suggestion === "NULL" ||
      suggestion.toLowerCase() === text.toLowerCase()
    ) {
      return null;
    }
    return suggestion;
  } catch (error) {
    console.error("Spell Check Error:", error);
    return null;
  }
};

/**
 * Analyze image using Gemini 2.5 Pro Vision
 */
export const analyzeImage = async (
  base64Image: string,
  mimeType: string
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const response = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
      "Bạn là nhà nghiên cứu văn hóa Việt Nam. Hãy phân tích hình ảnh này bằng tiếng Việt. Nếu có chữ, hãy dịch. Nếu là trang phục, món ăn hay cảnh vật, hãy mô tả chi tiết và nêu ý nghĩa văn hóa nếu có.",
    ]);
    return response.response.text() || "Không thể phân tích hình ảnh.";
  } catch (error) {
    console.error("Image Analysis Error:", error);
    return "Lỗi khi phân tích hình ảnh.";
  }
};

/**
 * Generate Speech using Gemini 2.5 Flash TTS
 */
export const generateSpeech = async (
  text: string,
  voice: string = "Kore"
): Promise<void> => {
  try {
    // Note: The @google/generative-ai SDK doesn't currently support TTS features
    // Falling back to browser TTS directly
    throw new Error("TTS not supported in current SDK version");
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    // Fallback to browser TTS using shared helper
    if (isBrowserTTSAvailable()) {
      console.log("Falling back to browser TTS");
      await speakWithBrowserTTS(text, { lang: "vi-VN" });
    } else {
      throw error;
    }
  }
};

/**
 * Chat with Gemini
 */
export const sendChatMessage = async (
  history: { role: string; text: string }[],
  newMessage: string
) => {
  // Convert generic history format to Gemini format
  // History items from ChatBot are like { role: 'assistant'|'user', text: '...' }
  const geminiHistory = history.map((msg) => ({
    role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
    parts: [{ text: msg.text }],
  }));

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      systemInstruction:
        "Bạn là trợ lý ảo am hiểu văn hóa Nùng và Miền Trung. Hãy trả lời thân thiện, chính xác và đậm đà bản sắc.",
    });
    const chat = model.startChat({
      history: geminiHistory,
    });

    const result = await chat.sendMessage(newMessage);
    return result.response.text();
  } catch (error) {
    console.error("Chat Error:", error);
    return "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại.";
  }
};
