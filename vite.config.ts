import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { IncomingMessage, ServerResponse } from "http";

function withVercelHelpers(
  res: ServerResponse
): ServerResponse & {
  status: (code: number) => typeof resWithHelpers;
  json: (payload: unknown) => ServerResponse;
} {
  const resWithHelpers = res as ServerResponse & {
    status: (code: number) => typeof resWithHelpers;
    json: (payload: unknown) => ServerResponse;
  };

  resWithHelpers.status = (code: number) => {
    res.statusCode = code;
    return resWithHelpers;
  };

  resWithHelpers.json = (payload: unknown) => {
    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
    }
    res.end(JSON.stringify(payload));
    return res;
  };

  return resWithHelpers;
}

async function readJsonBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  const rawBody = Buffer.concat(chunks).toString("utf8").trim();
  return rawBody ? JSON.parse(rawBody) : {};
}

function llmProxyDevPlugin() {
  return {
    name: "llm-proxy-dev-middleware",
    configureServer(server: any) {
      server.middlewares.use(
        "/api/llm-proxy",
        async (req: IncomingMessage, res: ServerResponse) => {
          try {
            const handlerModule = await import("./api/llm-proxy.ts");
            const handler = handlerModule.default;
            const vercelReq = req as IncomingMessage & { body?: unknown };
            const vercelRes = withVercelHelpers(res);

            if (req.method === "POST") {
              vercelReq.body = await readJsonBody(req);
            } else {
              vercelReq.body = {};
            }

            await handler(vercelReq as any, vercelRes as any);
          } catch (error: any) {
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
            }
            res.end(
              JSON.stringify({
                error: error?.message || "Vite LLM proxy middleware error",
              })
            );
          }
        }
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  for (const key of [
    "ROUTER_API_KEY",
    "ROUTER_BASE_URL",
    "ROUTER_MODEL",
    "ROUTER_VISION_MODEL",
  ]) {
    if (env[key]) {
      process.env[key] = env[key];
    }
  }

  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    plugins: [tailwindcss(), react(), llmProxyDevPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
