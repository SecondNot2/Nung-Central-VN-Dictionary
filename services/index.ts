/**
 * Services barrel export
 * Re-exports all shared service modules
 */

// Audio utilities
export { decodeBase64, decodeAudioData, playAudioBuffer } from "./audioHelpers";

// TTS utilities
export {
  speakWithBrowserTTS,
  isBrowserTTSAvailable,
  stopSpeech,
  getVoicesForLanguage,
  type TTSOptions,
} from "./ttsHelper";

// LLM client utilities
export {
  callMegaLLM,
  cleanJsonResponse,
  parseJsonResponse,
  type LLMMessage,
  type LLMConfig,
  type LLMCallOptions,
} from "./llmClient";

// Translation rules and prompts
export {
  LANGUAGE_DESCRIPTIONS,
  getLanguageDescription,
  buildViToNungRules,
  buildNungToViRules,
  buildCentralVietnameseRules,
  buildStandardVietnameseRules,
  getTranslationRules,
  SYSTEM_PROMPT_TRANSLATION,
  SYSTEM_PROMPT_CHAT,
  SYSTEM_PROMPT_SPELL_CHECK,
  FEW_SHOT_EXAMPLES,
  buildTranslationPrompt,
  buildSpellCheckPrompt,
} from "./translationRules";

// Vocabulary lookup - Logic functions
export {
  smartLookup,
  lookupWord,
  inferWordFromPhrases,
  buildInferredVocabulary,
  reverseNungLookup,
  getVietnameseTranslations,
  getReverseDictionary,
  smartReverseLookup,
  type InferredWord,
  type ReverseNungEntry,
} from "./nungVocab";

// Data exports - Dictionary data
export type { NungWord } from "../data";
export { NUNG_DICTIONARY } from "../data";
