/**
 * LLM API Client
 * Shared wrapper for calling LLM APIs (MegaLLM, etc.)
 */

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface LLMCallOptions {
  temperature?: number;
  responseFormat?: { type: string };
  maxTokens?: number;
}

// Default MegaLLM configuration
const DEFAULT_MEGA_LLM_CONFIG: LLMConfig = {
  apiKey: import.meta.env.VITE_MEGA_LLM_API_KEY || "",
  baseUrl: "https://ai.megallm.io/v1",
  model: "deepseek-ai/deepseek-v3.1",
};

/**
 * Call MegaLLM API with messages
 * @param messages - Array of chat messages
 * @param options - Optional parameters (temperature, response format)
 * @param config - Optional custom LLM configuration
 */
export async function callMegaLLM(
  messages: LLMMessage[],
  options: LLMCallOptions = {},
  config: LLMConfig = DEFAULT_MEGA_LLM_CONFIG
): Promise<string> {
  const { temperature = 0.7, responseFormat, maxTokens } = options;

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature,
      ...(responseFormat && { response_format: responseFormat }),
      ...(maxTokens && { max_tokens: maxTokens }),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
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
