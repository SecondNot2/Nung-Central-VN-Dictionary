import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
const envPath = path.resolve(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const API_KEY = process.env.VITE_MEGA_LLM_API_KEY;
const BASE_URL = "https://ai.megallm.io/v1";
const MODEL_NAME = "moonshotai/kimi-k2-instruct-0905";

console.log(
  `Testing MegaLLM API Key with ${MODEL_NAME}: ${
    API_KEY ? API_KEY.substring(0, 10) + "..." : "UNDEFINED"
  }`
);

async function testMegaLLM() {
  if (!API_KEY) {
    console.error("❌ Error: VITE_MEGA_LLM_API_KEY not found in .env.local");
    return;
  }

  try {
    console.log(`\n🔄 Sending request to ${BASE_URL}/chat/completions...\n`);

    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          {
            role: "user",
            content: "Xin chào! Hãy giới thiệu ngắn gọn về bản thân bạn.",
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      console.error("Response:", errorText);
      return;
    }

    const data = await response.json();

    console.log(`✅ Success! MegaLLM API Key is valid for ${MODEL_NAME}.`);
    console.log("\n📝 Response:");
    console.log("─".repeat(60));
    console.log(data.choices[0].message.content);
    console.log("─".repeat(60));
    console.log("\n📊 Usage:");
    console.log(`   Prompt tokens: ${data.usage?.prompt_tokens || "N/A"}`);
    console.log(
      `   Completion tokens: ${data.usage?.completion_tokens || "N/A"}`
    );
    console.log(`   Total tokens: ${data.usage?.total_tokens || "N/A"}`);
  } catch (error) {
    console.error("❌ API/Network Error:");
    console.error(error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
  }
}

testMegaLLM();
