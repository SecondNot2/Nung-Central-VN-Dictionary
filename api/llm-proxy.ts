import type { VercelRequest, VercelResponse } from "@vercel/node";

type RouterContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

type RouterMessage = {
  role: string;
  content: string | RouterContentPart[];
};

type RouterConfig = {
  apiKey?: string;
  baseUrl?: string;
  model: string;
  visionModel: string;
};

function normalizeRouterBaseUrl(baseUrl?: string) {
  if (!baseUrl) {
    return baseUrl;
  }

  const trimmed = baseUrl.replace(/\/$/, "");

  try {
    const parsed = new URL(trimmed);
    const pathname = parsed.pathname.replace(/\/$/, "");

    if (!pathname || pathname === "") {
      parsed.pathname = "/v1";
      return parsed.toString().replace(/\/$/, "");
    }

    if (pathname === "/v1") {
      return parsed.toString().replace(/\/$/, "");
    }

    return trimmed;
  } catch {
    return trimmed;
  }
}

function parseNestedJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function formatUpstreamError(rawText: string, router: RouterConfig) {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return "LLM gateway call failed";
  }

  const parsed = parseNestedJson(trimmed);
  const topLevelError = parsed?.error;
  const nestedMessage =
    typeof topLevelError?.message === "string"
      ? parseNestedJson(topLevelError.message)
      : null;
  const nestedError = nestedMessage?.error;

  const message =
    nestedError?.message ||
    topLevelError?.message ||
    parsed?.message ||
    trimmed;
  const type = nestedError?.type || topLevelError?.type;
  const code = nestedError?.code || topLevelError?.code;

  if (
    typeof message === "string" &&
    /No active credentials for provider:\s*gemini-cli/i.test(message)
  ) {
    return [
      `${message}.`,
      `Current model: ${router.model}.`,
      "In 9Router, connect the provider backing this model, or set LLM_MODEL/ROUTER_MODEL to a model alias with active credentials such as NungDic.",
    ].join(" ");
  }

  if (
    typeof code === "string" &&
    code === "model_not_found" &&
    typeof message === "string"
  ) {
    return `${message}. Current model: ${router.model}. Check that LLM_MODEL/ROUTER_MODEL exists in 9Router and that its provider has active credentials.`;
  }

  if (typeof message === "string") {
    const suffix =
      type || code ? ` (${[type, code].filter(Boolean).join(", ")})` : "";
    return `${message}${suffix}`;
  }

  return trimmed;
}

function getRouterConfig() {
  const isProduction =
    process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
  const configuredBaseUrl = process.env.LLM_BASE_URL
    ? process.env.LLM_BASE_URL.replace(/\/$/, "")
    : normalizeRouterBaseUrl(process.env.ROUTER_BASE_URL);
  const baseUrl = configuredBaseUrl || (isProduction ? "" : "http://localhost:20128/v1");
  const configuredModel =
    process.env.LLM_MODEL ||
    process.env.ROUTER_MODEL ||
    process.env.ROUTER_TEXT_MODEL;
  const model = configuredModel || (isProduction ? "" : "NungDic");
  const visionModel =
    process.env.LLM_VISION_MODEL || process.env.ROUTER_VISION_MODEL || model;

  if (!model) {
    throw new Error(
      "Missing LLM_MODEL or ROUTER_MODEL in production. Set it to a 9Router model alias with active provider credentials, for example NungDic."
    );
  }

  return {
    apiKey: process.env.LLM_API_KEY || process.env.ROUTER_API_KEY,
    baseUrl,
    model,
    visionModel,
  };
}

function badRequest(res: VercelResponse, message: string, status = 400) {
  return res.status(status).json({ error: message });
}

function extractJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth++;
      continue;
    }

    if (char === "}") {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
}

function parseRouterResponseText(rawText: string) {
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error("Empty 9Router response");
  }

  const withoutDone = trimmed.replace(/\s*data:\s*\[DONE\]\s*$/i, "").trim();

  try {
    return JSON.parse(withoutDone);
  } catch {
    const sseLines = withoutDone
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim())
      .filter((line) => line && line !== "[DONE]");

    for (const line of sseLines) {
      try {
        return JSON.parse(line);
      } catch {
        // Continue until a valid JSON line is found.
      }
    }

    const extracted = extractJsonObject(withoutDone);
    if (extracted) {
      return JSON.parse(extracted);
    }

    throw new Error("Invalid 9Router JSON response");
  }
}

async function callRouterChatCompletion(payload: {
  messages: RouterMessage[];
  temperature?: number;
  responseFormat?: { type: string };
  maxTokens?: number;
  model?: string;
}) {
  const router = getRouterConfig();

  if (!router.apiKey) {
    throw new Error(
      "Missing LLM_API_KEY or ROUTER_API_KEY in server environment"
    );
  }

  if (!router.baseUrl) {
    throw new Error(
      "Missing LLM_BASE_URL or ROUTER_BASE_URL in production server environment"
    );
  }

  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(router.baseUrl)) {
    throw new Error(
      "LLM_BASE_URL/ROUTER_BASE_URL cannot point to localhost in production. Use a reachable HTTPS endpoint, or run 9Router on a public/self-hosted server that Vercel can access."
    );
  }

  let response: Response;
  try {
    response = await fetch(`${router.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${router.apiKey}`,
      },
      body: JSON.stringify({
        model: payload.model || router.model,
        messages: payload.messages,
        temperature: payload.temperature ?? 0.7,
        ...(payload.responseFormat
          ? { response_format: payload.responseFormat }
          : {}),
        ...(payload.maxTokens ? { max_tokens: payload.maxTokens } : {}),
      }),
    });
  } catch (error: any) {
    throw new Error(
      `Unable to reach the configured LLM gateway at ${router.baseUrl}. Check LLM_BASE_URL/ROUTER_BASE_URL and confirm the endpoint is reachable from Vercel.${error?.cause?.message ? ` ${error.cause.message}` : ""}`
    );
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(formatUpstreamError(text, router));
  }

  const rawText = await response.text();
  const data = parseRouterResponseText(rawText);
  return data?.choices?.[0]?.message?.content ?? "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return badRequest(res, "Method not allowed", 405);
  }

  try {
    const {
      messages,
      options,
      prompt,
      temperature = 0.7,
      model,
      systemInstruction,
      history,
      image,
    } = (req.body || {}) as {
      messages?: Array<{ role: string; content: string }>;
      options?: {
        temperature?: number;
        responseFormat?: { type: string };
        maxTokens?: number;
        model?: string;
      };
      prompt?: string;
      temperature?: number;
      model?: string;
      systemInstruction?: string;
      history?: { role: "user" | "model"; text: string }[];
      image?: { base64: string; mimeType: string };
    };

    if (Array.isArray(messages) && messages.length > 0) {
      const content = await callRouterChatCompletion({
        messages,
        temperature: options?.temperature,
        responseFormat: options?.responseFormat,
        maxTokens: options?.maxTokens,
        model: options?.model,
      });

      return res.status(200).json({ content });
    }

    const router = getRouterConfig();
    const requestMessages: RouterMessage[] = [];

    if (systemInstruction) {
      requestMessages.push({ role: "system", content: systemInstruction });
    }

    for (const item of history || []) {
      requestMessages.push({
        role: item.role === "model" ? "assistant" : "user",
        content: item.text,
      });
    }

    const userContent = [
      prompt ? { type: "text" as const, text: prompt } : null,
      image?.base64 && image.mimeType
        ? {
            type: "image_url" as const,
            image_url: {
              url: `data:${image.mimeType};base64,${image.base64}`,
            },
          }
        : null,
    ].filter(Boolean) as RouterContentPart[];

    if (userContent.length === 0) {
      return badRequest(res, "Missing router payload");
    }

    requestMessages.push({
      role: "user",
      content:
        userContent.length === 1 && userContent[0].type === "text"
          ? userContent[0].text
          : userContent,
    });

    const content = await callRouterChatCompletion({
      messages: requestMessages,
      temperature,
      model: image ? router.visionModel : model,
    });

    return res.status(200).json({ content });
  } catch (error: any) {
    return badRequest(res, error?.message || "LLM proxy error", 500);
  }
}
