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

// Contribution type matching Supabase schema
export interface Contribution {
  id: string;
  word: string;
  translation: string;
  source_lang: string;
  target_lang: string;
  phonetic?: string;
  region?: string;
  example?: string;
  meaning?: string;
  status: "pending" | "approved" | "rejected";
  reject_reason?: string;
  contributor_id?: string;
  reviewer_id?: string;
  created_at: string;
  reviewed_at?: string;
}

// User type for authentication
export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  avatar?: string;
}

// Auth state type
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Saved Translation type
export interface SavedTranslation {
  id: string;
  userId: string;
  originalText: string;
  sourceLang: string;
  targetLang: string;
  result: TranslationResult;
  createdAt: string;
}

// Discussion types
export interface Discussion {
  id: string;
  translationKey: string;
  userId: string | null;
  userName?: string;
  userAvatar?: string;
  content: string;
  likeCount: number;
  isLikedByUser?: boolean;
  parentId: string | null;
  replies?: Discussion[];
  createdAt: string;
  updatedAt: string;
}

export type DiscussionSortOption = "newest" | "oldest" | "most_liked";

export enum AppRoute {
  DICTIONARY = "dictionary",
  IMAGE_ANALYSIS = "image_analysis",
  CHAT = "chat",
  CONTRIBUTE = "contribute",
  ADMIN = "admin",
  LOGIN = "login",
  REGISTER = "register",
  ADMIN_DICTIONARY = "admin_dictionary",
  DICTIONARY_LIST = "dictionary_list",
  ADMIN_DASHBOARD = "admin_dashboard",
  ADMIN_USERS = "admin_users",
  ADMIN_SUGGESTIONS = "admin_suggestions",
  ADMIN_REPORTS = "admin_reports",
  PROFILE = "profile",
  MY_LIBRARY = "my_library",
  NOT_FOUND = "404",
}
