/**
 * Services barrel export
 * Re-exports all shared service modules
 */

// Audio utilities
export {
  decodeBase64,
  decodeAudioData,
  playAudioBuffer,
} from "./utils/audioHelpers";

// TTS utilities
export {
  speakWithBrowserTTS,
  isBrowserTTSAvailable,
  stopSpeech,
  getVoicesForLanguage,
  type TTSOptions,
} from "./utils/ttsHelper";

// LLM client utilities
export {
  callMegaLLM,
  cleanJsonResponse,
  parseJsonResponse,
  type LLMMessage,
  type LLMConfig,
  type LLMCallOptions,
} from "./ai/llmClient";

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
} from "./dictionary/translationRules";

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
} from "./dictionary/nungVocab";

// Data exports - Dictionary data
export type { NungWord } from "../data";
export { NUNG_DICTIONARY } from "../data";

// Supabase client
export { supabase, isSupabaseConfigured } from "./api/supabaseClient";

// Contribution service
export {
  submitContribution,
  getContributions,
  updateContribution,
  approveContribution,
  rejectContribution,
  deleteContribution,
  type Contribution,
  type ContributionInput,
  type ContributionUpdate,
} from "./api/contributionService";

// Dictionary display service
export {
  getDictionaryEntries,
  getDictionaryStats,
  searchDictionary,
  type DictionaryEntry,
} from "./dictionary/dictionaryDisplayService";

// Auth service
export {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  getCurrentSession,
  getUserProfile,
  onAuthStateChange,
  signInWithGoogle,
  type UserProfile,
  type AuthResult,
} from "./api/authService";

// Dictionary service (Supabase CRUD)
export {
  getDictionaryEntriesFromDB,
  addDictionaryEntry,
  updateDictionaryEntry,
  deleteDictionaryEntry,
  getApprovedEntriesCount,
  type DictionaryEntryDB,
  type DictionaryEntryInput,
} from "./api/dictionaryService";

// Approved vocab service (merge contributions into lookup)
export {
  getApprovedContributions,
  getApprovedContributionsMap,
  clearApprovedContributionsCache,
  getApprovedCacheStatus,
} from "./dictionary/approvedVocabService";

// Combined lookup functions from nungVocab
export {
  lookupWordCombined,
  getCombinedDictionaryCount,
} from "./dictionary/nungVocab";
