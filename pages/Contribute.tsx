import React, { useState, useEffect } from "react";
import { ToastContainer, useToast } from "../components";

const CONTRIBUTIONS_KEY = "user_contributions";

// Types
interface Contribution {
  id: string;
  word: string;
  translation: string;
  sourceLang: string;
  targetLang: string;
  phonetic: string;
  region: string;
  example: string;
  meaning: string;
  timestamp: number;
}

// Language Options
const languageOptions = [
  { value: "vi", label: "Tiếng Việt", icon: "fa-flag" },
  { value: "nung", label: "Tiếng Nùng (Lạng Sơn)", icon: "fa-mountain" },
  { value: "central", label: "Tiếng Nghệ An / Hà Tĩnh", icon: "fa-wheat-awn" },
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

const Contribute: React.FC = () => {
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [sourceLang, setSourceLang] = useState("vi");
  const [targetLang, setTargetLang] = useState("nung");
  const [phonetic, setPhonetic] = useState("");
  const [region, setRegion] = useState("");
  const [example, setExample] = useState("");
  const [meaning, setMeaning] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  // Load contributions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(CONTRIBUTIONS_KEY);
    if (saved) {
      try {
        setContributions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse contributions", e);
      }
    }
  }, []);

  // Get filtered target options (exclude source language)
  const getTargetOptions = () => {
    return languageOptions.filter((opt) => opt.value !== sourceLang);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!word.trim() || !translation.trim()) {
      addToast("Vui lòng nhập từ/cụm từ và bản dịch", "warning");
      return;
    }

    setSubmitting(true);

    // Simulate API call delay
    setTimeout(() => {
      const newContribution: Contribution = {
        id: Date.now().toString(),
        word: word.trim(),
        translation: translation.trim(),
        sourceLang,
        targetLang,
        phonetic: phonetic.trim(),
        region,
        example: example.trim(),
        meaning: meaning.trim(),
        timestamp: Date.now(),
      };

      const updatedContributions = [newContribution, ...contributions];
      setContributions(updatedContributions);
      localStorage.setItem(
        CONTRIBUTIONS_KEY,
        JSON.stringify(updatedContributions)
      );

      // Reset form
      setWord("");
      setTranslation("");
      setPhonetic("");
      setExample("");
      setMeaning("");

      setSubmitting(false);
      addToast("Cảm ơn bạn! Đóng góp đã được lưu thành công.", "success");
    }, 800);
  };

  // Delete contribution
  const deleteContribution = (id: string) => {
    const updated = contributions.filter((c) => c.id !== id);
    setContributions(updated);
    localStorage.setItem(CONTRIBUTIONS_KEY, JSON.stringify(updated));
    addToast("Đã xóa đóng góp", "info");
  };

  // Get language label
  const getLangLabel = (code: string) => {
    return languageOptions.find((l) => l.value === code)?.label || code;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-earth-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-bamboo-100 text-bamboo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <i className="fa-solid fa-hand-holding-heart"></i>
          </div>
          <h2 className="text-3xl font-serif font-bold text-earth-900">
            Đóng góp dữ liệu
          </h2>
          <p className="text-earth-700 mt-2">
            Giúp chúng tôi bảo tồn ngôn ngữ Nùng và các phương ngữ địa phương.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Language Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-earth-800 mb-2">
                <i className="fa-solid fa-language mr-2 text-earth-500"></i>
                Ngôn ngữ gốc
              </label>
              <select
                value={sourceLang}
                onChange={(e) => {
                  setSourceLang(e.target.value);
                  if (e.target.value === targetLang) {
                    setTargetLang(e.target.value === "vi" ? "nung" : "vi");
                  }
                }}
                className="w-full border border-earth-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-bamboo-500 outline-none text-earth-900 bg-white"
              >
                {languageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-800 mb-2">
                <i className="fa-solid fa-arrow-right mr-2 text-earth-500"></i>
                Ngôn ngữ dịch
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full border border-earth-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-bamboo-500 outline-none text-earth-900 bg-white"
              >
                {getTargetOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Word/Phrase Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-earth-800 mb-2">
                <i className="fa-solid fa-pen mr-2 text-earth-500"></i>
                Từ / Cụm từ gốc <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={word}
                onChange={(e) => setWord(e.target.value)}
                type="text"
                className="w-full border border-earth-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-bamboo-500 outline-none text-earth-900"
                placeholder={`Nhập từ ${getLangLabel(sourceLang)}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-800 mb-2">
                <i className="fa-solid fa-language mr-2 text-earth-500"></i>
                Bản dịch <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                type="text"
                className="w-full border border-earth-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-bamboo-500 outline-none text-earth-900"
                placeholder={`Dịch sang ${getLangLabel(targetLang)}`}
              />
            </div>
          </div>

          {/* Phonetic & Region */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-earth-800 mb-2">
                <i className="fa-solid fa-volume-high mr-2 text-earth-500"></i>
                Phiên âm / Cách đọc
              </label>
              <input
                value={phonetic}
                onChange={(e) => setPhonetic(e.target.value)}
                type="text"
                className="w-full border border-earth-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-bamboo-500 outline-none text-earth-900"
                placeholder="Ví dụ: /piː vaŋ miː/"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-800 mb-2">
                <i className="fa-solid fa-map-location-dot mr-2 text-earth-500"></i>
                Vùng miền / Phương ngữ
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full border border-earth-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-bamboo-500 outline-none text-earth-900 bg-white"
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
            <label className="block text-sm font-medium text-earth-800 mb-2">
              <i className="fa-solid fa-quote-left mr-2 text-earth-500"></i>
              Câu ví dụ
            </label>
            <input
              value={example}
              onChange={(e) => setExample(e.target.value)}
              type="text"
              className="w-full border border-earth-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-bamboo-500 outline-none text-earth-900"
              placeholder="Ví dụ câu sử dụng từ này trong ngữ cảnh"
            />
          </div>

          {/* Meaning & Context */}
          <div>
            <label className="block text-sm font-medium text-earth-800 mb-2">
              <i className="fa-solid fa-book mr-2 text-earth-500"></i>Ý nghĩa &
              Ngữ cảnh
            </label>
            <textarea
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              className="w-full border border-earth-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-bamboo-500 outline-none h-24 text-earth-900"
              placeholder="Giải thích ý nghĩa chi tiết, ngữ cảnh sử dụng, hoặc ghi chú văn hóa..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full font-bold py-3 rounded-lg transition-all shadow-md flex items-center justify-center ${
              submitting
                ? "bg-earth-300 text-earth-600 cursor-not-allowed"
                : "bg-bamboo-600 hover:bg-bamboo-700 text-white"
            }`}
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                Đang gửi...
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane mr-2"></i>
                Gửi đóng góp
              </>
            )}
          </button>
        </form>

        {/* Contribution History Toggle */}
        {contributions.length > 0 && (
          <div className="mt-8 border-t border-earth-200 pt-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between text-earth-700 hover:text-bamboo-600 transition-colors"
            >
              <span className="font-medium">
                <i className="fa-solid fa-clock-rotate-left mr-2"></i>
                Đóng góp của bạn ({contributions.length})
              </span>
              <i
                className={`fa-solid fa-chevron-down transition-transform ${
                  showHistory ? "rotate-180" : ""
                }`}
              ></i>
            </button>

            {showHistory && (
              <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                {contributions.map((c) => (
                  <div
                    key={c.id}
                    className="bg-earth-50 rounded-lg p-4 border border-earth-100 group relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 text-xs text-earth-500">
                        <span className="bg-earth-200 px-2 py-0.5 rounded">
                          {getLangLabel(c.sourceLang)}
                        </span>
                        <i className="fa-solid fa-arrow-right"></i>
                        <span className="bg-bamboo-100 text-bamboo-700 px-2 py-0.5 rounded">
                          {getLangLabel(c.targetLang)}
                        </span>
                        {c.region && (
                          <span className="text-earth-400">• {c.region}</span>
                        )}
                      </div>
                      <span className="text-xs text-earth-400">
                        {new Date(c.timestamp).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-earth-900">{c.word}</p>
                      </div>
                      <div>
                        <p className="font-medium text-bamboo-700">
                          {c.translation}
                        </p>
                        {c.phonetic && (
                          <p className="text-sm text-earth-500 italic">
                            {c.phonetic}
                          </p>
                        )}
                      </div>
                    </div>
                    {c.example && (
                      <p className="text-sm text-earth-600 mt-2 italic">
                        <i className="fa-solid fa-quote-left text-earth-300 mr-1"></i>
                        {c.example}
                      </p>
                    )}
                    {c.meaning && (
                      <p className="text-sm text-earth-600 mt-1">{c.meaning}</p>
                    )}
                    <button
                      onClick={() => deleteContribution(c.id)}
                      className="absolute top-2 right-2 p-1.5 text-earth-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      title="Xóa đóng góp"
                    >
                      <i className="fa-solid fa-trash-can text-sm"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contribute;
