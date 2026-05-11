/**
 * Translation Rules & Prompts
 * Shared translation rules for Tày and Nùng languages
 */

import { smartLookup, reverseNungLookup, type InferredWord } from "../dictionary/nungVocab";

// ============================================================
// LANGUAGE DESCRIPTIONS
// ============================================================

const LANGUAGE_DESCRIPTIONS: Record<string, string> = {
  vi: "Tiếng Việt",
  nung: "Tiếng Nùng",
  tay: "Tiếng Tày",
};

export function getLanguageDescription(code: string): string {
  return LANGUAGE_DESCRIPTIONS[code] || code;
}

// ============================================================
// TRANSLATION RULES BUILDERS
// ============================================================

/**
 * Build translation rules for Vietnamese → Nùng
 */
export function buildViToNungRules(text: string): string {
  const lookupResult = smartLookup(text);
  const foundWords: string[] = [];
  const inferredWords: string[] = [];

  // Thêm các từ tìm thấy trực tiếp trong từ điển
  for (const match of lookupResult.directMatches) {
    foundWords.push(
      `- "${match.word}" phải dịch là "${match.entry.script}"${
        match.entry.phonetic ? ` (phiên âm: ${match.entry.phonetic})` : ""
      }${match.entry.notes ? ` [${match.entry.notes}]` : ""}`
    );
  }

  // Thêm các từ được suy luận từ cụm từ khác
  for (const inferred of lookupResult.inferredMatches) {
    const confidenceText =
      inferred.confidence === "high"
        ? "chắc chắn"
        : inferred.confidence === "medium"
        ? "khá chắc"
        : "có thể";
    inferredWords.push(
      `- "${inferred.word}" có thể dịch là "${inferred.script}" (${confidenceText}, suy luận từ: ${inferred.source})`
    );
  }

  return `
    === QUY TẮC BẮT BUỘC CHO TIẾNG NÙNG ===
    1. **Từ vựng BẮT BUỘC từ từ điển** (PHẢI dùng chính xác):
    ${
      foundWords.length > 0
        ? foundWords.join("\n    ")
        : "    (Không có từ vựng trực tiếp trong từ điển)"
    }
    
    2. **Từ vựng SUY LUẬN** (Tham khảo, có thể dùng nếu phù hợp ngữ cảnh):
    ${
      inferredWords.length > 0
        ? inferredWords.join("\n    ")
        : "    (Không có từ vựng suy luận)"
    }
    
    3. **Quy tắc về danh từ chỉ loài (Classifiers) - CỰC KỲ QUAN TRỌNG**:
       - "con" + ĐỘNG VẬT (lợn, trâu, bò, gà, vịt, chó, mèo...) → PHẢI dùng "tua" hoặc "tu"
         VÍ DỤ: "con lợn" → "tua mu" hoặc "tu mu" (KHÔNG DÙNG "lục" hay "Lộc")
         VÍ DỤ: "con trâu" → "tua vài" hoặc "tu vài" (KHÔNG DÙNG "lục" hay "Lộc")
       - "con" + CON NGƯỜI (con tôi, con cái...) → dùng "lục" hoặc "Lộc"
         VÍ DỤ: "con tôi" → "lục kủa" hoặc "Lộc kủa"
    
    4. **Quy tắc so sánh**:
       - "hơn" trong câu so sánh → dùng "quá"
         VÍ DỤ: "Con lợn to hơn con trâu" → "Tu mu cải quá tu vài" hoặc "Tua mu cải quá tua vài"
    
    5. **Quy tắc chung**:
       - Rảnh rỗi → "váng"
       - Không (hỏi) → "mí"
       - Anh/Chị → Pì
       
    6. **Tuyệt đối**: KHÔNG dùng từ Tày hoặc Nùng Phạn Slinh.
    `;
}

/**
 * Build translation rules for Nùng → Vietnamese
 */
export function buildNungToViRules(text: string): string {
  const lookupResult = reverseNungLookup(text);
  const foundWords: string[] = [];
  const partialWords: string[] = [];

  // Thêm các từ tìm thấy trực tiếp
  for (const match of lookupResult.directMatches) {
    const viMeanings = match.entries.map((e) => e.vietnamese).join(" / ");
    const notes = match.entries[0].notes ? ` [${match.entries[0].notes}]` : "";
    foundWords.push(`- "${match.nungWord}" → "${viMeanings}"${notes}`);
  }

  // Thêm các từ khớp một phần
  for (const match of lookupResult.partialMatches) {
    const viMeanings = match.entries.map((e) => e.vietnamese).join(" / ");
    partialWords.push(
      `- "${match.nungWord}" ≈ "${viMeanings}" (khớp một phần)`
    );
  }

  return `
    === QUY TẮC DỊCH TỪ TIẾNG NÙNG SANG TIẾNG VIỆT ===
    1. **Từ vựng TÌM THẤY trong từ điển** (ĐÃ XÁC MINH - ƯU TIÊN SỬ DỤNG):
    ${
      foundWords.length > 0
        ? foundWords.join("\n    ")
        : "    (Không tìm thấy từ vựng chính xác trong từ điển)"
    }
    
    2. **Từ vựng KHỚP MỘT PHẦN** (Tham khảo thêm):
    ${
      partialWords.length > 0
        ? partialWords.join("\n    ")
        : "    (Không có từ vựng khớp một phần)"
    }
    
    3. **Các từ KHÔNG TÌM THẤY** (Cần dịch dựa trên ngữ cảnh):
    ${
      lookupResult.notFound.length > 0
        ? `    - ${lookupResult.notFound.join(", ")}`
        : "    (Tất cả các từ đều được tìm thấy)"
    }
    
    4. **Quy tắc dịch ngược**:
       - "tua" hoặc "tu" + động vật → "con" + tên động vật
         VÍ DỤ: "tua mu" → "con lợn", "tu vài" → "con trâu"
       - "lục" hoặc "Lộc" trong ngữ cảnh gia đình → "con" (con cái)
         VÍ DỤ: "lục kủa" → "con tôi"
       - "Pì" → "Anh" hoặc "Chị" (tùy ngữ cảnh)
       - "mí" → "không" (trong câu hỏi)
       - "váng" → "rảnh rỗi"
       - "kin khẩu" → "ăn cơm"
       - "kin nặm" → "uống nước"
       
    5. **Giữ nguyên sắc thái văn hóa**: Dịch sao cho tự nhiên, phù hợp với ngữ cảnh Việt Nam hiện đại.
    `;
}

/**
 * Build translation rules for Tày language
 */
export function buildTayRules(): string {
  return `
    === QUY TẮC CHO TIẾNG TÀY ===
    1. Tiếng Tày có nhiều nét tương đồng với tiếng Nùng nhưng có một số khác biệt về từ vựng và ngữ điệu vùng miền.
    `;
}

/**
 * Build translation rules for standard Vietnamese
 */
export function buildStandardVietnameseRules(): string {
  return "Dịch chuẩn xác sang tiếng Việt phổ thông, giải thích rõ nghĩa nếu là từ cổ hoặc từ địa phương khó hiểu.";
}

/**
 * Get translation rules based on source and target language codes
 */
export function getTranslationRules(
  text: string,
  sourceCode: string,
  targetCode: string
): { targetLangDesc: string; specificRules: string } {
  let targetLangDesc = "";
  let specificRules = "";

  // Nùng → Vietnamese
  if (sourceCode === "nung" && targetCode === "vi") {
    targetLangDesc = "Tiếng Việt phổ thông";
    specificRules = buildNungToViRules(text);
  }
  // Vietnamese → Nùng
  else if (targetCode === "nung") {
    targetLangDesc = "Tiếng Nùng";
    specificRules = buildViToNungRules(text);
  }
  // Tày language
  else if (targetCode === "tay") {
    targetLangDesc = "Tiếng Tày";
    specificRules = buildTayRules();
  }
  // Standard Vietnamese
  else if (targetCode === "vi") {
    targetLangDesc = "Tiếng Việt phổ thông";
    specificRules = buildStandardVietnameseRules();
  }
  // Both Tày and Nùng
  else {
    targetLangDesc = "Cả Tiếng Tày và Tiếng Nùng";
    specificRules = "Áp dụng quy tắc của cả hai ngôn ngữ trên.";
  }

  return { targetLangDesc, specificRules };
}

// ============================================================
// PROMPT TEMPLATES
// ============================================================

export const SYSTEM_PROMPT_TRANSLATION = `Bạn là chuyên gia ngôn ngữ học Việt Nam, chuyên sâu về:
- Tiếng Nùng & Tiếng Tày - nhóm ngôn ngữ Tày-Thái
- Ngữ pháp, từ vựng và văn hóa dân tộc thiểu số miền núi phía Bắc

NHIỆM VỤ: Dịch chính xác, giữ nguyên ý nghĩa và sắc thái văn hóa.
BẮT BUỘC TRẢ VỀ ĐẦY ĐỦ 4 PHẦN:
1. Văn bản gốc / Chữ viết (Script)
2. Phiên âm / Cách đọc (Phonetic)
3. Từ vựng & Định nghĩa & Example (Definitions)
4. Ghi chú văn hóa (Cultural Note) - LUÔN LUÔN PHẢI CÓ, giải thích bối cảnh hoặc sắc thái từ vựng.`;

export const FEW_SHOT_EXAMPLES = `
VÍ DỤ DỊCH TIẾNG NÙNG:
- Input: "Bạn có rảnh không?"
  Output: {"translations":[{"language":"Tiếng Nùng (Lạng Sơn)","script":"Pì váng mí?","phonetic":"Pi vaŋ mi"}],"definitions":[{"word":"váng","definition":"rảnh rỗi, không bận","example":"Khỏi váng lai (Tôi rảnh lắm)"}],"culturalNote":"Trong văn hóa Nùng, khi hỏi thăm thường dùng từ 'váng' để thể hiện sự quan tâm nhẹ nhàng, không suống sã."}

VÍ DỤ DỊCH TIẾNG TÀY:
- Input: "Anh ấy đi đâu vậy?"
  Output: {"translations":[{"language":"Tiếng Tày","script":"Pe nớ pây mô lổ?","phonetic":"Pe no pay mo lo"}],"definitions":[{"word":"pây","definition":"đi","example":"Pây chơ (Đi chợ)"}],"culturalNote":"Tiếng Tày và Nùng có nhiều điểm tương đồng nhưng ngữ điệu tiếng Tày thường nhẹ nhàng hơn."}
`;

export const SYSTEM_PROMPT_CHAT =
  "Bạn là trợ lý ảo am hiểu văn hóa Tày và Nùng. Hãy trả lời thân thiện, chính xác và đậm đà bản sắc.";

export const SYSTEM_PROMPT_SPELL_CHECK = `Bạn là công cụ kiểm tra chính tả Tiếng Việt.
Nhiệm vụ: Kiểm tra xem văn bản sau có lỗi chính tả không.
Nếu có lỗi, hãy đưa ra CÂU ĐÚNG gợi ý.
Nếu không có lỗi, trả về "NULL".
Chỉ trả về văn bản gợi ý hoặc "NULL". Không giải thích.`;

/**
 * Build translation prompt
 */
export function buildTranslationPrompt(
  text: string,
  sourceLangDesc: string,
  targetLangDesc: string,
  specificRules: string
): string {
  return `${FEW_SHOT_EXAMPLES}

=== NHIỆM VỤ HIỆN TẠI ===
Dịch từ ${sourceLangDesc} sang ${targetLangDesc}
${specificRules}

YÊU CẦU OUTPUT NGHIÊM NGẶT:
1. Chỉ trả về JSON object duy nhất (KHÔNG có markdown, KHÔNG có text thừa)
2. Format chính xác:
{
  "translations": [
    { "language": "Tên ngôn ngữ đích", "script": "Văn bản dịch", "phonetic": "Phiên âm IPA hoặc cách đọc chuẩn" }
  ],
  "definitions": [
    { "word": "Từ vựng quan trọng", "definition": "Nghĩa chi tiết", "example": "Câu ví dụ minh họa (có dịch nghĩa)" }
  ],
  "culturalNote": "Ghi chú văn hóa: Giải thích nguồn gốc từ, bối cảnh sử dụng hoặc sắc thái văn hóa (BẮT BUỘC CÓ)"
}

Câu cần dịch: "${text}"

Hãy dịch CHÍNH XÁC, giữ nguyên ý nghĩa và phong cách. Trả về JSON thuần túy.`;
}

/**
 * Build spell check prompt
 */
export function buildSpellCheckPrompt(text: string): string {
  return `${SYSTEM_PROMPT_SPELL_CHECK}

Văn bản: "${text}"`;
}
