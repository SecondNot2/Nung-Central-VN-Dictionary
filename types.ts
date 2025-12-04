export interface WordDefinition {
  word: string;
  definition: string;
  example: string;
}

export interface TranslationDetail {
  language: string; // e.g., "Tiếng Nùng"
  script: string; // Original transcription / Written form
  phonetic: string; // Spoken transcription
}

export interface TranslationResult {
  original: string;
  translations: TranslationDetail[];
  definitions: WordDefinition[];
  culturalNote?: string;
}

export interface TranslationHistoryItem {
  id: string;
  original: string;
  sourceLang: string;
  targetLang: string;
  result: TranslationResult;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

export enum AppRoute {
  DICTIONARY = "dictionary",
  IMAGE_ANALYSIS = "image_analysis",
  CHAT = "chat",
  CONTRIBUTE = "contribute",
}
