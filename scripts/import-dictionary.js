import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, "../tudientiengnung.csv");
const OUTPUT_PATH = path.join(__dirname, "../services/nungVocab.ts");

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function importDictionary() {
  try {
    const data = fs.readFileSync(CSV_PATH, "utf8");
    const lines = data.split(/\r?\n/);

    const dictionary = {};

    // Skip header (line 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = parseCSVLine(line);

      // Expected columns: Tiếng Việt, Tiếng Tày/Nùng, Phiên âm, Ghi chú
      const vietnamese = columns[0];
      const script = columns[1];
      const phonetic = columns[2];
      const notes = columns[3];

      if (vietnamese && script) {
        const key = vietnamese.toLowerCase();

        dictionary[key] = {
          script: script,
          phonetic: phonetic || "",
          notes: notes || "",
        };
      }
    }

    const fileContent = `export interface NungWord {
  script: string;
  phonetic: string;
  notes?: string;
}

export const NUNG_DICTIONARY: Record<string, NungWord> = ${JSON.stringify(
      dictionary,
      null,
      2
    )};
`;

    fs.writeFileSync(OUTPUT_PATH, fileContent, "utf8");
    console.log(
      `Successfully imported ${
        Object.keys(dictionary).length
      } words to ${OUTPUT_PATH}`
    );
  } catch (error) {
    console.error("Error importing dictionary:", error);
  }
}

importDictionary();
