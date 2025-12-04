// Test translation with improved prompt and dictionary lookup
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Manually define dictionary for test script to avoid TS/ESM issues
const NUNG_DICTIONARY = {
  // Pronouns
  tôi: { script: "khỏi", phonetic: "khɔi" },
  bạn: {
    script: "pì",
    phonetic: "pi",
    notes: "hoặc 'mưng' nếu thân mật/ít tuổi hơn",
  },
  "anh ấy": { script: "chư", phonetic: "cɯ" },
  "cô ấy": { script: "chư", phonetic: "cɯ" },
  nó: { script: "man", phonetic: "man" },
  "chúng tôi": { script: "bâu", phonetic: "bəu" },

  // Common Verbs
  đi: { script: "pay", phonetic: "pây" },
  ngủ: { script: "nòn", phonetic: "nɔn" },
  "đi ngủ": { script: "pay nòn", phonetic: "pây nɔn" },
  ăn: { script: "kin", phonetic: "kin" },
  uống: { script: "kin", phonetic: "kin" },
  làm: { script: "hét", phonetic: "hɛt" },
  về: { script: "mừa", phonetic: "mɯa" },
  biết: { script: "hú", phonetic: "hu" },
  không: { script: "mí", phonetic: "mi", notes: "dùng trong câu hỏi/phủ định" },
  có: { script: "mì", phonetic: "mi" },
  yêu: { script: "nhia", phonetic: "ɲia" },
  thích: { script: "nha", phonetic: "ɲa" },

  // Animals
  con: { script: "tua", phonetic: "tua" },
  "con lợn": { script: "tua mu", phonetic: "tua mu" },
  lợn: { script: "mu", phonetic: "mu" },
  "con trâu": { script: "tua vài", phonetic: "tua va:i" },
  trâu: { script: "vài", phonetic: "va:i" },
  "con bò": { script: "tua mò", phonetic: "tua mɔ" },
  bò: { script: "mò", phonetic: "mɔ" },
  "con gà": { script: "tua cáy", phonetic: "tua kai" },
  gà: { script: "cáy", phonetic: "kai" },
  "con chó": { script: "tua ma", phonetic: "tua ma" },
  chó: { script: "ma", phonetic: "ma" },
  "con mèo": { script: "tua méo", phonetic: "tua mɛu" },
  mèo: { script: "méo", phonetic: "mɛu" },
  "con vịt": { script: "tua pết", phonetic: "tua pet" },
  vịt: { script: "pết", phonetic: "pet" },

  // Common Adjectives
  đẹp: { script: "slinh", phonetic: "sliɲ" },
  tốt: { script: "đây", phonetic: "ɗəi" },
  ngon: { script: "ngon", phonetic: "ŋɔn" },
  to: { script: "lương", phonetic: "lɯəŋ" },
  bé: { script: "í", phonetic: "i" },
  nhiều: { script: "lai", phonetic: "lai" },
  ít: { script: "noi", phonetic: "nɔi" },
  rảnh: { script: "váng", phonetic: "va:ŋ" },
  "rảnh rỗi": { script: "váng", phonetic: "va:ŋ" },
  bận: { script: "mác", phonetic: "ma:k" },

  // Time
  "hôm nay": { script: "vằn nảy", phonetic: "van nai" },
  "ngày mai": { script: "vằn phuka", phonetic: "van phu:ka" },
  "hôm qua": { script: "vằn qua", phonetic: "van kwa" },
  "bây giờ": { script: "nhằng nảy", phonetic: "ɲaŋ nai" },
};

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

async function testTranslation(text, expected) {
  const targetLang = "Tiếng Nùng (Lạng Sơn)";

  // Simulate the service logic
  const lowerText = text.toLowerCase();
  const foundWords = [];
  const sortedKeys = Object.keys(NUNG_DICTIONARY).sort(
    (a, b) => b.length - a.length
  );

  for (const key of sortedKeys) {
    if (lowerText.includes(key)) {
      const entry = NUNG_DICTIONARY[key];
      foundWords.push(
        `- "${key}" phải dịch là "${entry.script}" (phiên âm: ${entry.phonetic})`
      );
    }
  }

  const specificRules = `
    === QUY TẮC BẮT BUỘC CHO TIẾNG NÙNG ===
    1. **Từ vựng BẮT BUỘC** (Nếu xuất hiện trong câu, PHẢI dùng từ này):
    ${
      foundWords.length > 0
        ? foundWords.join("\n    ")
        : "    (Không có từ vựng đặc biệt trong từ điển)"
    }
    
    2. **Quy tắc chung**:
       - Rảnh rỗi -> "váng"
       - Không (hỏi) -> "mí"
       - Anh/Chị -> Pì
    3. **Tuyệt đối**: KHÔNG dùng từ Tày hoặc Nùng Phạn Slinh.
    `;

  const systemMessage = `Bạn là chuyên gia ngôn ngữ học Việt Nam, chuyên sâu về:
- Tiếng Nùng (Lạng Sơn) - ngôn ngữ Tày-Thái
- Phương ngữ Miền Trung (Nghệ An, Hà Tĩnh)
- Ngữ pháp, từ vựng và văn hóa địa phương

NHIỆM VỤ: Dịch chính xác, giữ nguyên ý nghĩa và sắc thái văn hóa.`;

  const fewShotExamples = `
VÍ DỤ DỊCH TIẾNG NÙNG:
- Input: "Bạn có rảnh không?"
  Output: {"translations":[{"language":"Tiếng Nùng (Lạng Sơn)","script":"Pì váng mí?","phonetic":"Pi vaŋ mi"}],"definitions":[{"word":"váng","definition":"rảnh rỗi, không bận","example":"Tôi váng lắm"}],"culturalNote":"Từ 'váng' là đặc trưng của tiếng Nùng Lạng Sơn"}
`;

  const prompt = `${fewShotExamples}

=== NHIỆM VỤ HIỆN TẠI ===
Dịch từ Tiếng Việt sang ${targetLang}
${specificRules}

YÊU CẦU OUTPUT NGHIÊM NGẶT:
1. Chỉ trả về JSON object duy nhất (KHÔNG có markdown, KHÔNG có text thừa)
2. Format chính xác:
{
  "translations": [
    { "language": "Tên ngôn ngữ đích", "script": "Văn bản dịch", "phonetic": "Phiên âm IPA hoặc cách đọc" }
  ],
  "definitions": [
    { "word": "Từ quan trọng", "definition": "Nghĩa rõ ràng", "example": "Câu ví dụ thực tế" }
  ],
  "culturalNote": "Ghi chú văn hóa ngắn gọn (nếu có)"
}

Câu cần dịch: "${text}"

Hãy dịch CHÍNH XÁC, giữ nguyên ý nghĩa và phong cách. Trả về JSON thuần túy.`;

  console.log(`\n🧪 Testing: "${text}"`);
  console.log(`   Expected contains: "${expected}"`);
  console.log(`   Dictionary Context: ${foundWords.length} words found`);

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    const cleanJson = result
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleanJson);
    const script = parsed.translations[0].script;

    console.log(`   ✅ Result: "${script}"`);

    if (script.toLowerCase().includes(expected.toLowerCase())) {
      console.log("   🎉 PASS");
    } else {
      console.log("   ❌ FAIL");
    }
  } catch (error) {
    console.error("   ❌ Error:", error.message);
  }
}

async function runTests() {
  console.log("🚀 Starting Verification Tests...\n");
  await testTranslation("Tôi đi ngủ đây", "pay nòn");
  await testTranslation("Con lợn này to quá", "tua mu");
  await testTranslation("Con trâu đang ăn cỏ", "tua"); // Check for 'tua' prefix, accept 'vài' or 'vày'
}

runTests();
