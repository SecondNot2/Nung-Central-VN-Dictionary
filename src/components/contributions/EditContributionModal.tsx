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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white border-2 border-black shadow-brutal w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-black text-white px-8 py-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border-2 border-white bg-nung-red flex items-center justify-center">
              <i className="fa-solid fa-pen-nib text-xl"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase tracking-tight">
                Hiệu đính đóng góp
              </h3>
              <p className="text-gray-400 text-xs font-bold uppercase">
                Chỉnh sửa thông tin chính xác
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-10 h-10 border-2 border-white bg-white text-black flex items-center justify-center hover:bg-nung-red hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Language Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Ngôn ngữ gốc
              </label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full border-2 border-black bg-white p-3 font-bold uppercase tracking-widest text-xs outline-none transition-all appearance-none cursor-pointer"
              >
                {languageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Ngôn ngữ dịch
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full border-2 border-black bg-white p-3 font-bold uppercase tracking-widest text-xs outline-none transition-all appearance-none cursor-pointer"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Từ / Cụm từ gốc <span className="text-nung-red">*</span>
              </label>
              <input
                required
                value={word}
                onChange={(e) => setWord(e.target.value)}
                className="w-full border-2 border-black p-3 font-bold text-lg outline-none transition-all"
                placeholder="Nhập từ cần dịch..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Bản dịch đề xuất <span className="text-nung-red">*</span>
              </label>
              <input
                required
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                className="w-full border-2 border-black p-3 font-bold text-lg text-nung-blue outline-none transition-all"
                placeholder="Bản dịch tiếng Nùng..."
              />
            </div>
          </div>

          {/* Phonetic & Region */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Phiên âm (IPA)
              </label>
              <input
                value={phonetic}
                onChange={(e) => setPhonetic(e.target.value)}
                className="w-full border-2 border-black p-3 font-bold italic outline-none transition-all"
                placeholder="/piː vaŋ miː/"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Khu vực / Biến thể
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full border-2 border-black bg-white p-3 font-bold uppercase tracking-widest text-xs outline-none transition-all appearance-none cursor-pointer"
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
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              Ví dụ sử dụng trong câu
            </label>
            <textarea
              value={example}
              onChange={(e) => setExample(e.target.value)}
              rows={2}
              className="w-full border-2 border-black p-3 font-medium italic outline-none transition-all resize-none"
              placeholder="Câu ví dụ minh họa..."
            />
          </div>

          {/* Meaning */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              Ý nghĩa & Ngữ cảnh giải thích
            </label>
            <textarea
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              rows={3}
              className="w-full border-2 border-black p-3 font-medium outline-none transition-all resize-none"
              placeholder="Giải thích thêm về từ vựng này..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end pt-6 border-t-2 border-black">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-white border-2 border-black font-bold uppercase text-[10px] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-black text-white border-2 border-black font-bold uppercase text-[10px] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50"
            >
              {saving ? (
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fa-solid fa-save mr-2"></i>
              )}
              Lưu & Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContributionModal;
