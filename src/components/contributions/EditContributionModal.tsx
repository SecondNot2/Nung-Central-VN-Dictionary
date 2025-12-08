import React, { useState, useEffect } from "react";
import { Contribution } from "../../types";

interface EditContributionModalProps {
  isOpen: boolean;
  contribution: Contribution | null;
  onSave: (id: string, updates: Partial<Contribution>) => void;
  onCancel: () => void;
}

// Language & Region Options
const languageOptions = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "nung", label: "Tiếng Nùng (Lạng Sơn)" },
  { value: "central", label: "Tiếng Nghệ An / Hà Tĩnh" },
];

const regionOptions = [
  { value: "", label: "Chọn vùng miền (tùy chọn)" },
  { value: "lang-son", label: "Lạng Sơn" },
  { value: "cao-bang", label: "Cao Bằng" },
  { value: "bac-kan", label: "Bắc Kạn" },
  { value: "tuyen-quang", label: "Tuyên Quang" },
  { value: "thai-nguyen", label: "Thái Nguyên" },
  { value: "quang-ninh", label: "Quảng Ninh" },
  { value: "nghe-an", label: "Nghệ An" },
  { value: "ha-tinh", label: "Hà Tĩnh" },
  { value: "other", label: "Khác" },
];

export const EditContributionModal: React.FC<EditContributionModalProps> = ({
  isOpen,
  contribution,
  onSave,
  onCancel,
}) => {
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [sourceLang, setSourceLang] = useState("vi");
  const [targetLang, setTargetLang] = useState("nung");
  const [phonetic, setPhonetic] = useState("");
  const [region, setRegion] = useState("");
  const [example, setExample] = useState("");
  const [meaning, setMeaning] = useState("");
  const [saving, setSaving] = useState(false);

  // Populate form when contribution changes
  useEffect(() => {
    if (contribution) {
      setWord(contribution.word || "");
      setTranslation(contribution.translation || "");
      setSourceLang(contribution.source_lang || "vi");
      setTargetLang(contribution.target_lang || "nung");
      setPhonetic(contribution.phonetic || "");
      setRegion(contribution.region || "");
      setExample(contribution.example || "");
      setMeaning(contribution.meaning || "");
    }
  }, [contribution]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribution) return;

    setSaving(true);
    await onSave(contribution.id, {
      word: word.trim(),
      translation: translation.trim(),
      source_lang: sourceLang,
      target_lang: targetLang,
      phonetic: phonetic.trim() || undefined,
      region: region || undefined,
      example: example.trim() || undefined,
      meaning: meaning.trim() || undefined,
    });
    setSaving(false);
  };

  if (!isOpen || !contribution) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all w-full max-w-2xl animate-fade-in">
          {/* Header */}
          <div className="bg-bamboo-50 px-6 py-4 border-b border-bamboo-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-bamboo-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-pen-to-square text-bamboo-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-earth-900">
                  Chỉnh sửa đóng góp
                </h3>
                <p className="text-sm text-earth-600">
                  Sửa thông tin trước khi duyệt
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Language Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">
                  Ngôn ngữ gốc
                </label>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="w-full border border-earth-300 rounded-lg px-3 py-2 text-earth-900 bg-white focus:ring-2 focus:ring-bamboo-500 outline-none"
                >
                  {languageOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">
                  Ngôn ngữ dịch
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full border border-earth-300 rounded-lg px-3 py-2 text-earth-900 bg-white focus:ring-2 focus:ring-bamboo-500 outline-none"
                >
                  {languageOptions
                    .filter((opt) => opt.value !== sourceLang)
                    .map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Word & Translation */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">
                  Từ / Cụm từ gốc <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  className="w-full border border-earth-300 rounded-lg px-3 py-2 text-earth-900 focus:ring-2 focus:ring-bamboo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">
                  Bản dịch <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  className="w-full border border-earth-300 rounded-lg px-3 py-2 text-earth-900 focus:ring-2 focus:ring-bamboo-500 outline-none"
                />
              </div>
            </div>

            {/* Phonetic & Region */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">
                  Phiên âm
                </label>
                <input
                  value={phonetic}
                  onChange={(e) => setPhonetic(e.target.value)}
                  className="w-full border border-earth-300 rounded-lg px-3 py-2 text-earth-900 focus:ring-2 focus:ring-bamboo-500 outline-none"
                  placeholder="/piː vaŋ miː/"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">
                  Vùng miền
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full border border-earth-300 rounded-lg px-3 py-2 text-earth-900 bg-white focus:ring-2 focus:ring-bamboo-500 outline-none"
                >
                  {regionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Example */}
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1">
                Câu ví dụ
              </label>
              <input
                value={example}
                onChange={(e) => setExample(e.target.value)}
                className="w-full border border-earth-300 rounded-lg px-3 py-2 text-earth-900 focus:ring-2 focus:ring-bamboo-500 outline-none"
              />
            </div>

            {/* Meaning */}
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1">
                Ý nghĩa & Ngữ cảnh
              </label>
              <textarea
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                rows={3}
                className="w-full border border-earth-300 rounded-lg px-3 py-2 text-earth-900 focus:ring-2 focus:ring-bamboo-500 outline-none resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-earth-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl font-medium text-earth-700 bg-white border border-earth-300 hover:bg-earth-100 transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-5 py-2.5 rounded-xl font-medium text-white transition-all shadow-md hover:shadow-lg flex items-center gap-2 ${
                  saving
                    ? "bg-earth-400 cursor-not-allowed"
                    : "bg-bamboo-600 hover:bg-bamboo-700"
                }`}
              >
                {saving ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i>
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditContributionModal;
