/**
 * Test file để kiểm tra chức năng suy luận từ vựng
 */
import { NUNG_DICTIONARY } from "./data";
import {
  lookupWord,
  inferWordFromPhrases,
  smartLookup,
  buildInferredVocabulary,
} from "./services/nungVocab";

console.log("=== TEST SỰ SUY LUẬN TỪ VỰNG ===\n");

// Test 1: Kiểm tra từ "ngủ" có trong từ điển trực tiếp không
console.log("1. Kiểm tra từ điển trực tiếp:");
console.log('   "đi ngủ":', NUNG_DICTIONARY["đi ngủ"]);
console.log('   "đi":', NUNG_DICTIONARY["đi"]);
console.log('   "ngủ":', NUNG_DICTIONARY["ngủ"] || "(không có)");
console.log('   "buồn ngủ":', NUNG_DICTIONARY["buồn ngủ"]);
console.log('   "ngủ ngon":', NUNG_DICTIONARY["ngủ ngon"]);
console.log();

// Test 2: Suy luận từ "ngủ"
console.log('2. Suy luận từ "ngủ":');
const inferredNgu = inferWordFromPhrases("ngủ");
console.log("   Kết quả:", inferredNgu);
console.log();

// Test 3: Sử dụng lookupWord
console.log("3. Sử dụng lookupWord():");
console.log('   lookupWord("đi"):', lookupWord("đi"));
console.log('   lookupWord("ngủ"):', lookupWord("ngủ"));
console.log('   lookupWord("buồn"):', lookupWord("buồn"));
console.log();

// Test 4: Sử dụng smartLookup
console.log('4. Sử dụng smartLookup("tôi đi ngủ"):');
const result = smartLookup("tôi đi ngủ");
console.log("   Từ tìm thấy trực tiếp:", result.directMatches);
console.log("   Từ suy luận:", result.inferredMatches);
console.log("   Không tìm thấy:", result.notFound);
console.log();

// Test 5: Xây dựng từ vựng suy luận
console.log("5. Một số từ được suy luận từ từ điển:");
const inferredVocab = buildInferredVocabulary();
console.log(`   Tổng số từ suy luận được: ${inferredVocab.size}`);
console.log("   Một số ví dụ:");
let count = 0;
for (const [word, inferred] of inferredVocab) {
  if (count >= 10) break;
  console.log(
    `   - "${word}" → "${inferred.script}" (${inferred.confidence}, từ: ${inferred.source})`
  );
  count++;
}
