/**
 * 9Router client helpers
 * Shared wrappers for calling the local server proxy.
 */

export interface RouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface RouterConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export interface RouterChatOptions {
  temperature?: number;
  responseFormat?: { type: string };
  maxTokens?: number;
  model?: string;
}

export interface RouterPromptPayload {
  prompt: string;
  temperature?: number;
  model?: string;
  systemInstruction?: string;
  history?: { role: "user" | "model"; text: string }[];
  image?: { base64: string; mimeType: string };
}

export async function callRouterChat(
  messages: RouterMessage[],
  options: RouterChatOptions = {},
  _config?: RouterConfig
): Promise<string> {
  const response = await fetch("/api/llm-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, options }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.content;
}

export async function callRouterPrompt(
  payload: RouterPromptPayload
): Promise<string> {
  const response = await fetch("/api/llm-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`9Router API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.content;
}

/**
 * Clean JSON response from LLM (remove markdown code blocks if present)
 */
export function cleanJsonResponse(text: string): string {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

/**
 * Parse JSON response safely
 */
export function parseJsonResponse<T>(text: string, fallback: T): T {
  try {
    const cleanJson = cleanJsonResponse(text);
    return JSON.parse(cleanJson) as T;
  } catch (error) {
    console.error("JSON Parse Error:", error);
    return fallback;
  }
}
