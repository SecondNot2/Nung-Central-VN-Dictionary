import React, { useState, useEffect, useRef } from "react";
import {
  translateText,
  generateSpeech,
  checkSpelling,
} from "../services/megaLlmService";
import { TranslationResult, TranslationHistoryItem } from "../types";
import {
  ToastContainer,
  useToast,
  ConfirmDialog,
  CustomSelect,
  SelectOption,
} from "../components";

const HISTORY_KEY = "translation_history";

const Dictionary: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [sourceLang, setSourceLang] = useState("vi");
  const [targetLang, setTargetLang] = useState("nung");
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [ttsLoading, setTtsLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [spellingSuggestion, setSpellingSuggestion] = useState<string | null>(
    null
  );

  // Toast notification
  const { toasts, addToast, removeToast } = useToast();

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "danger" | "warning" | "info";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "danger",
    onConfirm: () => {},
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const historySectionRef = useRef<HTMLDivElement>(null);

  // Language options
  const sourceLanguageOptions: SelectOption[] = [
    {
      value: "vi",
      label: "Tiếng Việt",
      icon: "fa-flag",
      description: "Ngôn ngữ phổ thông",
    },
    {
      value: "nung",
      label: "Tiếng Nùng (Lạng Sơn)",
      icon: "fa-mountain",
      description: "Dân tộc Nùng",
    },
    {
      value: "central",
      label: "Tiếng Nghệ An / Hà Tĩnh",
      icon: "fa-wheat-awn",
      description: "Phương ngữ miền Trung",
    },
  ];

  const allTargetLanguageOptions: SelectOption[] = [
    {
      value: "nung",
      label: "Tiếng Nùng (Lạng Sơn)",
      icon: "fa-mountain",
      description: "Dân tộc Nùng",
    },
    {
      value: "central",
      label: "Tiếng Nghệ An / Hà Tĩnh",
      icon: "fa-wheat-awn",
      description: "Phương ngữ miền Trung",
    },
    {
      value: "vi",
      label: "Tiếng Việt",
      icon: "fa-flag",
      description: "Ngôn ngữ phổ thông",
    },
    {
      value: "all",
      label: "Cả hai (Nùng & MT)",
      icon: "fa-layer-group",
      description: "Dịch sang tất cả",
    },
  ];

  // Filter target options based on source language
  const getFilteredTargetOptions = (): SelectOption[] => {
    return allTargetLanguageOptions.filter((opt) => {
      // Exclude the same language as source
      if (opt.value === sourceLang) return false;
      // Only show "all" option when source is Vietnamese
      if (opt.value === "all" && sourceLang !== "vi") return false;
      return true;
    });
  };

  // Handle swap languages
  const handleSwapLanguages = () => {
    // Don't swap if target is "all"
    if (targetLang === "all") {
      addToast(
        "Không thể hoán đổi khi đang dịch sang tất cả ngôn ngữ",
        "warning"
      );
      return;
    }
    const newSource = targetLang;
    const newTarget = sourceLang;
    setSourceLang(newSource);
    setTargetLang(newTarget);
    addToast("Đã hoán đổi ngôn ngữ nguồn và đích", "info");
  };

  // Auto-adjust target language when source changes
  useEffect(() => {
    // If current target is same as new source, switch to a different target
    if (targetLang === sourceLang) {
      const newTarget = sourceLang === "vi" ? "nung" : "vi";
      setTargetLang(newTarget);
    }
    // If target is "all" but source is not Vietnamese, switch to Vietnamese
    if (targetLang === "all" && sourceLang !== "vi") {
      setTargetLang("vi");
    }
  }, [sourceLang]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Debounced spell check
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (inputText.trim().length > 5 && sourceLang === "vi") {
        const suggestion = await checkSpelling(inputText);
        setSpellingSuggestion(suggestion);
      } else {
        setSpellingSuggestion(null);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [inputText, sourceLang]);

  const saveToHistory = (item: TranslationHistoryItem) => {
    // Keep the most recent 50 items (increased from 5 for pagination demo)
    const filteredHistory = history.filter(
      (h) => h.original.toLowerCase() !== item.original.toLowerCase()
    );
    const newHistory = [item, ...filteredHistory].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    setCurrentPage(1); // Reset to first page on new entry
  };

  const clearHistory = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Xóa toàn bộ lịch sử?",
      message:
        "Bạn có chắc chắn muốn xóa toàn bộ lịch sử tra cứu? Hành động này không thể hoàn tác.",
      type: "danger",
      onConfirm: () => {
        setHistory([]);
        localStorage.removeItem(HISTORY_KEY);
        setCurrentPage(1);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        addToast("Đã xóa toàn bộ lịch sử tra cứu", "success");
      },
    });
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const itemToDelete = history.find((item) => item.id === id);
    setConfirmDialog({
      isOpen: true,
      title: "Xóa mục này?",
      message: `Bạn có muốn xóa "${itemToDelete?.original.slice(0, 30)}${
        (itemToDelete?.original.length || 0) > 30 ? "..." : ""
      }" khỏi lịch sử?`,
      type: "warning",
      onConfirm: () => {
        const newHistory = history.filter((item) => item.id !== id);
        setHistory(newHistory);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));

        // Adjust page if empty
        const maxPage = Math.ceil(newHistory.length / itemsPerPage) || 1;
        if (currentPage > maxPage) setCurrentPage(maxPage);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        addToast("Đã xóa mục khỏi lịch sử", "success");
      },
    });
  };

  const restoreHistoryItem = (item: TranslationHistoryItem) => {
    setInputText(item.original);
    setSourceLang(item.sourceLang || "vi");
    setTargetLang(item.targetLang);
    setResult(item.result);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    addToast("Đã khôi phục từ lịch sử", "info");
  };

  const applySuggestion = () => {
    if (spellingSuggestion) {
      setInputText(spellingSuggestion);
      setSpellingSuggestion(null);
      addToast("Đã áp dụng gợi ý chính tả", "info");
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null); // Clear previous results while loading
    try {
      const data = await translateText(inputText, targetLang, sourceLang);
      setResult(data);

      // Save successful translation to history
      saveToHistory({
        id: Date.now().toString(),
        original: inputText,
        sourceLang: sourceLang,
        targetLang: targetLang,
        result: data,
        timestamp: Date.now(),
      });
      addToast("Dịch thành công!", "success");
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi không xác định.");
      addToast("Dịch thất bại. Vui lòng thử lại.", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (text: string, idx: number) => {
    if (ttsLoading !== null) return;
    setTtsLoading(idx);
    try {
      // Voice selection: Kore gives a deeper tone, might fit earthy aesthetic better
      await generateSpeech(text, "Kore");
      addToast("Đang phát âm thanh...", "info");
    } catch (err) {
      console.error("TTS Error", err);
      setError("Không thể tạo âm thanh lúc này.");
      addToast("Không thể tạo âm thanh", "error");
    } finally {
      setTtsLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="text-center mb-10">
        <h1 className="text-4xl font-serif font-bold text-earth-900 mb-2">
          Từ điển ngôn ngữ dân tộc
        </h1>
        <p className="text-earth-700">
          Dịch tiếng Việt sang Tiếng Nùng (Lạng Sơn) và Phương ngữ Miền Trung
        </p>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() =>
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        }
        confirmText="Xóa"
        cancelText="Hủy"
      />

      {/* Input Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-earth-200">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <CustomSelect
            value={sourceLang}
            onChange={setSourceLang}
            options={sourceLanguageOptions}
            label="Ngôn ngữ nguồn"
          />
          <div className="flex items-end justify-center pb-3">
            <button
              type="button"
              onClick={handleSwapLanguages}
              disabled={targetLang === "all"}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                targetLang === "all"
                  ? "bg-earth-100 text-earth-300 cursor-not-allowed"
                  : "bg-bamboo-100 text-bamboo-600 hover:bg-bamboo-200 hover:scale-110 active:scale-95"
              }`}
              title="Hoán đổi ngôn ngữ"
            >
              <i className="fa-solid fa-arrow-right-arrow-left hidden md:block"></i>
              <i className="fa-solid fa-arrow-down-arrow-up md:hidden"></i>
            </button>
          </div>
          <CustomSelect
            value={targetLang}
            onChange={setTargetLang}
            options={getFilteredTargetOptions()}
            label="Ngôn ngữ đích"
          />
        </div>

        <div className="relative">
          <textarea
            className="w-full p-4 border border-earth-300 rounded-lg focus:ring-2 focus:ring-bamboo-500 focus:border-transparent outline-none transition-all text-lg min-h-[120px] bg-white text-earth-900 placeholder-earth-400"
            placeholder="Nhập câu tiếng Việt vào đây..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            spellCheck={false}
          />

          {/* Spell Check Suggestion */}
          {spellingSuggestion && (
            <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-bamboo-200 animate-fade-in">
              <span className="text-earth-500 text-sm mr-2">Ý bạn là:</span>
              <button
                onClick={applySuggestion}
                className="text-bamboo-700 font-bold hover:underline"
              >
                {spellingSuggestion}
              </button>
            </div>
          )}
          <button
            onClick={handleTranslate}
            disabled={loading || !inputText.trim()}
            className={`absolute bottom-4 right-4 px-6 py-2 rounded-full font-medium shadow-md transition-all flex items-center ${
              loading
                ? "bg-earth-300 text-earth-600 cursor-not-allowed"
                : "bg-bamboo-600 text-white hover:bg-bamboo-700 active:scale-95"
            }`}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Đang
                dịch...
              </>
            ) : (
              <>
                Dịch<i className="fa-solid fa-arrow-right ml-2"></i>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-r shadow-sm flex items-start">
          <i className="fa-solid fa-triangle-exclamation mt-1 mr-3"></i>
          <div>
            <p className="font-bold">Đã xảy ra lỗi</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !result && (
        <div className="space-y-6 animate-pulse">
          <div className="bg-white rounded-xl shadow-md border-l-4 border-earth-300 h-40 w-full p-6">
            <div className="h-6 bg-earth-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-10 bg-earth-100 rounded"></div>
              <div className="h-10 bg-earth-100 rounded"></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow h-32 w-full p-6">
            <div className="h-6 bg-earth-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-earth-100 rounded w-full mb-2"></div>
            <div className="h-4 bg-earth-100 rounded w-2/3"></div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Translation Cards */}
          {result.translations.map((trans, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md border-l-4 border-bamboo-500 overflow-hidden"
            >
              <div className="bg-bamboo-50 px-6 py-4 flex justify-between items-center border-b border-bamboo-100">
                <h2 className="text-xl font-bold text-bamboo-900">
                  {trans.language}
                </h2>
                <button
                  onClick={() => playAudio(trans.phonetic || trans.script, idx)}
                  className="flex items-center space-x-2 text-bamboo-700 hover:text-bamboo-900 transition-colors px-3 py-1 rounded hover:bg-bamboo-100"
                  disabled={ttsLoading !== null}
                  title="Nghe phát âm"
                >
                  {ttsLoading === idx ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                      <span className="text-sm font-medium">
                        Đang tạo âm thanh...
                      </span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-volume-high text-xl"></i>
                      <span className="text-sm font-medium">Nghe</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-6 grid gap-6 md:grid-cols-2">
                <div className="col-span-1">
                  <label className="text-xs font-bold text-earth-500 uppercase tracking-wider mb-1 block">
                    Văn bản gốc / Chữ viết
                  </label>
                  <p className="text-2xl text-earth-900 font-serif font-bold break-words">
                    {trans.script}
                  </p>
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-bold text-earth-500 uppercase tracking-wider mb-1 block">
                    Phiên âm / Cách đọc
                  </label>
                  <p className="text-xl text-bamboo-700 italic font-medium break-words">
                    {trans.phonetic}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Dictionary & Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Definitions */}
            {result.definitions && result.definitions.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-bold text-earth-800 mb-4 border-b border-earth-100 pb-2">
                  <i className="fa-solid fa-book-open mr-2 text-earth-500"></i>
                  Từ vựng & Định nghĩa
                </h3>
                <ul className="space-y-4">
                  {result.definitions.map((def, idx) => (
                    <li key={idx}>
                      <span className="font-bold text-bamboo-700 block text-lg">
                        {def.word}
                      </span>
                      <span className="text-earth-800 text-sm block mb-1">
                        {def.definition}
                      </span>
                      <span className="text-earth-500 text-xs italic block bg-earth-50 p-2 rounded">
                        <i className="fa-solid fa-quote-left mr-1 text-earth-300"></i>
                        {def.example}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cultural Note */}
            {result.culturalNote && (
              <div className="bg-earth-100 rounded-xl shadow p-6">
                <h3 className="text-lg font-bold text-earth-800 mb-4 border-b border-earth-200 pb-2">
                  <i className="fa-solid fa-leaf mr-2 text-bamboo-600"></i>
                  Ghi chú văn hóa
                </h3>
                <p className="text-earth-800 leading-relaxed text-sm">
                  {result.culturalNote}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <div
          ref={historySectionRef}
          className="mt-12 border-t border-earth-200 pt-8 animate-fade-in"
        >
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-serif font-bold text-earth-800">
              <i className="fa-solid fa-clock-rotate-left mr-2 text-earth-500"></i>
              Lịch sử tra cứu
            </h2>
            <button
              onClick={clearHistory}
              className="text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors flex items-center"
            >
              <i className="fa-solid fa-trash-can mr-2"></i> Xóa tất cả
            </button>
          </div>

          <div className="grid gap-4">
            {history
              .slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
              )
              .map((item) => (
                <div
                  key={item.id}
                  onClick={() => restoreHistoryItem(item)}
                  className="bg-white border border-earth-200 rounded-lg shadow-sm hover:shadow-md hover:border-bamboo-400 cursor-pointer transition-all group relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Source Side */}
                    <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-earth-100 bg-earth-50/30">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-earth-400 uppercase tracking-wider">
                          {item.sourceLang === "vi"
                            ? "Tiếng Việt"
                            : item.sourceLang === "nung"
                            ? "Tiếng Nùng"
                            : "Nghệ An/Hà Tĩnh"}
                        </span>
                        <span className="text-xs text-earth-300">
                          {new Date(item.timestamp).toLocaleTimeString(
                            "vi-VN",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      </div>
                      <p className="text-earth-900 font-medium text-lg break-words">
                        {item.original}
                      </p>
                    </div>

                    {/* Target Side */}
                    <div className="flex-1 p-4 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-bamboo-600 uppercase tracking-wider">
                          {item.targetLang === "nung"
                            ? "Tiếng Nùng"
                            : item.targetLang === "central"
                            ? "Nghệ An/Hà Tĩnh"
                            : item.targetLang === "vi"
                            ? "Tiếng Việt"
                            : "Tất cả"}
                        </span>
                      </div>
                      <p className="text-earth-800 text-lg break-words">
                        {item.result.translations[0]?.script}
                      </p>
                      {item.result.translations[0]?.phonetic && (
                        <p className="text-sm text-earth-500 italic mt-1">
                          {item.result.translations[0].phonetic}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delete Button (Hover) */}
                  <button
                    onClick={(e) => deleteHistoryItem(e, item.id)}
                    className="absolute top-2 right-2 p-2 text-earth-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                    title="Xóa mục này"
                  >
                    <i className="fa-solid fa-xmark text-lg"></i>
                  </button>
                </div>
              ))}
          </div>

          {/* Pagination Controls */}
          {history.length > itemsPerPage && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  historySectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                disabled={currentPage === 1}
                className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                  currentPage === 1
                    ? "border-earth-200 text-earth-300 cursor-not-allowed"
                    : "border-earth-300 text-earth-600 hover:bg-earth-50 hover:border-earth-400"
                }`}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>

              <span className="text-earth-600 font-medium px-4">
                Trang {currentPage} / {Math.ceil(history.length / itemsPerPage)}
              </span>

              <button
                onClick={() => {
                  setCurrentPage((p) =>
                    Math.min(Math.ceil(history.length / itemsPerPage), p + 1)
                  );
                  historySectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                disabled={
                  currentPage === Math.ceil(history.length / itemsPerPage)
                }
                className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                  currentPage === Math.ceil(history.length / itemsPerPage)
                    ? "border-earth-200 text-earth-300 cursor-not-allowed"
                    : "border-earth-300 text-earth-600 hover:bg-earth-50 hover:border-earth-400"
                }`}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dictionary;
