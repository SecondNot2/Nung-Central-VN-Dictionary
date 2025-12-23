import React, { useState, useEffect, useRef } from "react";
import { generateSpeech } from "../../services/ai/megaLlmService";
import {
  smartTranslateText,
  type TieredTranslationResult,
} from "../../services/dictionary/tieredTranslationService";
import {
  TranslationResult,
  TranslationHistoryItem,
  User,
  AppRoute,
} from "../../types";
import {
  ToastContainer,
  useToast,
  ConfirmDialog,
  CustomSelect,
  SelectOption,
  SaveTranslationButton,
  DiscussionSection,
  Pagination,
} from "../../components";
import SuggestEditButton from "../../components/dictionary/SuggestEditButton";
import {
  getHistory,
  addToHistory,
  deleteHistoryItem as deleteHistoryItemService,
  clearHistory as clearHistoryService,
  migrateLocalHistoryToDb,
} from "../../services/api/translationHistoryService";

interface DictionaryProps {
  user?: User | null;
  setRoute?: (route: AppRoute) => void;
}

const Dictionary: React.FC<DictionaryProps> = ({ user, setRoute }) => {
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

  // Load history on mount and when user changes
  useEffect(() => {
    const loadHistory = async () => {
      const items = await getHistory(user?.id);
      setHistory(items);
    };
    loadHistory();

    // Migrate local history to DB when user logs in
    if (user?.id) {
      migrateLocalHistoryToDb(user.id);
    }
  }, [user?.id]);

  // Spell check disabled to avoid excessive API calls
  // The tiered translation system handles local lookup first
  useEffect(() => {
    // Clear any previous suggestion when input changes
    setSpellingSuggestion(null);
  }, [inputText]);

  const saveToHistory = async (
    item: Omit<TranslationHistoryItem, "id" | "timestamp">
  ) => {
    const newItem = await addToHistory(
      {
        original: item.original,
        sourceLang: item.sourceLang,
        targetLang: item.targetLang,
        result: item.result,
      },
      user?.id
    );
    // Update local state
    setHistory((prev) => {
      const filtered = prev.filter(
        (h) => h.original.toLowerCase() !== item.original.toLowerCase()
      );
      return [newItem, ...filtered].slice(0, 50);
    });
    setCurrentPage(1);
  };

  const handleClearHistory = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Xóa toàn bộ lịch sử?",
      message:
        "Bạn có chắc chắn muốn xóa toàn bộ lịch sử tra cứu? Hành động này không thể hoàn tác.",
      type: "danger",
      onConfirm: async () => {
        await clearHistoryService(user?.id);
        setHistory([]);
        setCurrentPage(1);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        addToast("Đã xóa toàn bộ lịch sử tra cứu", "success");
      },
    });
  };

  const handleDeleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const itemToDelete = history.find((item) => item.id === id);
    setConfirmDialog({
      isOpen: true,
      title: "Xóa mục này?",
      message: `Bạn có muốn xóa "${itemToDelete?.original.slice(0, 30)}${
        (itemToDelete?.original.length || 0) > 30 ? "..." : ""
      }" khỏi lịch sử?`,
      type: "warning",
      onConfirm: async () => {
        await deleteHistoryItemService(id, user?.id);
        const newHistory = history.filter((item) => item.id !== id);
        setHistory(newHistory);

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
      // Use tiered translation (local -> DB -> API fallback)
      const tieredResult = await smartTranslateText(inputText, targetLang);

      console.log("[Dictionary] Tiered translation result:", {
        timeTaken: tieredResult.timeTaken,
        stats: tieredResult.stats,
        apiCalled: tieredResult.apiCalled,
      });

      // Convert TieredTranslationResult to TranslationResult format
      const data: TranslationResult = {
        original: tieredResult.original,
        translations: [
          {
            language:
              targetLang === "nung" ? "Tiếng Nùng (Lạng Sơn)" : "Phương ngữ",
            script: tieredResult.translation,
            phonetic: tieredResult.translation, // Use same for now
          },
        ],
        definitions: tieredResult.breakdown
          .filter((b) => b.notes)
          .map((b) => ({
            word: b.word,
            definition: b.translation,
            example: b.notes || "",
          })),
        culturalNote: tieredResult.apiCalled
          ? `Đã sử dụng ${tieredResult.stats.localHits} từ local, ${tieredResult.stats.inferred} suy luận, ${tieredResult.stats.apiCalls} từ API. Thời gian: ${tieredResult.timeTaken}ms`
          : `Dịch hoàn toàn từ local dictionary. Thời gian: ${tieredResult.timeTaken}ms`,
      };

      setResult(data);

      // Save successful translation to history
      saveToHistory({
        original: inputText,
        sourceLang: sourceLang,
        targetLang: targetLang,
        result: data,
      });

      // Show appropriate toast based on source
      if (tieredResult.stats.unknown > 0) {
        addToast(
          `Dịch xong! ${tieredResult.stats.unknown} từ chưa tìm thấy.`,
          "warning"
        );
      } else {
        addToast(`Dịch thành công! (${tieredResult.timeTaken}ms)`, "success");
      }
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

      <div className="text-center mb-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-12 bg-nung-sand/40 -rotate-1 skew-x-12 blur-xl -z-10"></div>
        <h1 className="text-4xl md:text-6xl font-display font-bold text-nung-dark mb-2 text-outline-light">
          Từ điển{" "}
          <span className="bg-nung-red text-white px-3 py-0.5 border-2 border-black inline-block transform rotate-1 shadow-brutal-sm ">
            Nùng
          </span>{" "}
          & Miền Trung
        </h1>
        <p className="text-nung-blue font-serif font-bold text-lg uppercase tracking-widest mt-6">
          Gìn giữ ngôn ngữ - Kết nối cội nguồn
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
      <div className="bg-white border-4 border-black shadow-brutal-lg p-8 mb-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-nung-red/5 -mr-8 -mt-8 transform rotate-45"></div>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1">
            <CustomSelect
              value={sourceLang}
              onChange={setSourceLang}
              options={sourceLanguageOptions}
              label="Ngôn ngữ nguồn"
            />
          </div>
          <div className="flex items-end justify-center pb-2">
            <button
              type="button"
              onClick={handleSwapLanguages}
              disabled={targetLang === "all"}
              className={`w-12 h-12 border-2 border-black flex items-center justify-center transition-all shadow-brutal-sm ${
                targetLang === "all"
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed opacity-50"
                  : "bg-white text-nung-red hover:bg-nung-red hover:text-white hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              }`}
              title="Hoán đổi ngôn ngữ"
            >
              <i className="fa-solid fa-arrow-right-arrow-left hidden md:block"></i>
              <i className="fa-solid fa-arrow-down-arrow-up md:hidden"></i>
            </button>
          </div>
          <div className="flex-1">
            <CustomSelect
              value={targetLang}
              onChange={setTargetLang}
              options={getFilteredTargetOptions()}
              label="Ngôn ngữ đích"
            />
          </div>
        </div>

        <div className="relative">
          <textarea
            className="w-full p-6 border-4 border-black font-body text-xl font-medium outline-none transition-all min-h-[160px] bg-nung-sand/10 text-nung-dark placeholder-gray-400 focus:bg-white"
            placeholder="Nhập nội dung cần tra cứu..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            spellCheck={false}
          />

          {/* Spell Check Suggestion */}
          {spellingSuggestion && (
            <div className="absolute bottom-6 left-6 z-10 bg-white border-2 border-black px-4 py-2 shadow-brutal-sm animate-fade-in flex items-center gap-3">
              <span className="text-gray-500 text-sm font-bold">Gợi ý:</span>
              <button
                onClick={applySuggestion}
                className="text-nung-red font-bold hover:underline"
              >
                {spellingSuggestion}
              </button>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleTranslate}
              disabled={loading || !inputText.trim()}
              className={`group flex items-center gap-3 px-8 py-4 border-2 border-black font-serif font-black text-xl uppercase tracking-wider transition-all shadow-brutal ${
                loading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none translate-x-1 translate-y-1"
                  : "bg-nung-red text-white hover:bg-white hover:text-nung-red hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              }`}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i> Đang xử
                  lý
                </>
              ) : (
                <>
                  Tra cứu{" "}
                  <i className="fa-solid fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
                </>
              )}
            </button>
          </div>
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
        <div className="space-y-8 animate-pulse">
          <div className="bg-white border-4 border-black shadow-brutal p-8">
            <div className="h-8 bg-gray-200 border-2 border-black w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-20 bg-gray-100 border-2 border-black"></div>
              <div className="h-20 bg-gray-100 border-2 border-black"></div>
            </div>
          </div>
          <div className="bg-white border-4 border-black shadow-brutal p-8">
            <div className="h-8 bg-gray-200 border-2 border-black w-1/3 mb-6"></div>
            <div className="h-4 bg-gray-100 border-2 border-black w-full mb-4"></div>
            <div className="h-4 bg-gray-100 border-2 border-black w-2/3"></div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && !loading && (
        <div className="space-y-12 mb-20">
          {/* Translation Cards */}
          <div className="grid grid-cols-1 gap-8">
            {result.translations.map((trans, idx) => (
              <div
                key={idx}
                className="bg-white border-4 border-black shadow-brutal-lg overflow-hidden relative group animate-fade-in"
              >
                <div className="bg-nung-sand border-b-4 border-black px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h2 className="text-3xl font-display font-bold text-nung-dark uppercase tracking-tight">
                      {trans.language}
                    </h2>
                    <div className="h-1 w-20 bg-nung-red mt-1"></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <SaveTranslationButton
                      user={user || null}
                      originalText={inputText}
                      sourceLang={sourceLang}
                      targetLang={targetLang}
                      result={result}
                      onSaveSuccess={() =>
                        addToast("Đã lưu bản dịch!", "success")
                      }
                      onLoginRequired={() => {
                        addToast(
                          "Vui lòng đăng nhập để lưu bản dịch",
                          "warning"
                        );
                        if (setRoute) setRoute(AppRoute.LOGIN);
                      }}
                    />
                    <button
                      onClick={() =>
                        playAudio(trans.phonetic || trans.script, idx)
                      }
                      className="bg-black text-white px-6 py-2 border-2 border-black font-bold flex items-center gap-3 shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                      disabled={ttsLoading !== null}
                      title="Nghe phát âm"
                    >
                      {ttsLoading === idx ? (
                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                      ) : (
                        <i className="fa-solid fa-volume-high"></i>
                      )}
                      <span>Nghe</span>
                    </button>

                    <SuggestEditButton
                      user={user || null}
                      originalText={inputText}
                      sourceLang={sourceLang}
                      targetLang={targetLang}
                      result={result}
                      onLoginRequired={() => {
                        addToast(
                          "Vui lòng đăng nhập để đề xuất chỉnh sửa",
                          "warning"
                        );
                        if (setRoute) setRoute(AppRoute.LOGIN);
                      }}
                      onSuccess={() =>
                        addToast("Đã gửi đề xuất chỉnh sửa!", "success")
                      }
                    />
                  </div>
                </div>

                <div className="p-8 grid gap-8 md:grid-cols-2 bg-paper">
                  <div className="col-span-1 p-6 bg-white border-2 border-black shadow-brutal-sm rotate-1 transition-transform group-hover:rotate-0">
                    <label className="text-xs font-black text-nung-red uppercase tracking-widest mb-3 block">
                      Văn bản gốc / Chữ viết
                    </label>
                    <p className="text-4xl text-nung-dark font-display font-black break-words leading-tight">
                      {trans.script}
                    </p>
                  </div>
                  <div className="col-span-1 p-6 bg-nung-blue/5 border-2 border-black shadow-brutal-sm -rotate-1 transition-transform group-hover:rotate-0">
                    <label className="text-xs font-black text-nung-blue uppercase tracking-widest mb-3 block">
                      Phiên âm / Cách đọc
                    </label>
                    <p className="text-2xl text-nung-blue italic font-bold break-words">
                      {trans.phonetic || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dictionary & Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Definitions */}
            {result.definitions && result.definitions.length > 0 && (
              <div className="bg-white border-4 border-black p-8 shadow-brutal relative">
                <div className="absolute top-4 right-4 text-nung-red/20 opacity-20">
                  <i className="fa-solid fa-book-open text-6xl"></i>
                </div>
                <h3 className="text-2xl font-display font-bold text-nung-dark mb-6 border-b-2 border-black pb-3">
                  📖 Từ vựng & Định nghĩa
                </h3>
                <ul className="space-y-6">
                  {result.definitions.map((def, idx) => (
                    <li key={idx} className="group">
                      <span className="font-display font-bold text-nung-red text-2xl block mb-1 group-hover:translate-x-1 transition-transform">
                        {def.word}
                      </span>
                      <p className="text-nung-dark font-medium mb-3">
                        {def.definition}
                      </p>
                      <div className="bg-nung-sand/20 p-4 border-l-4 border-black border-2 text-sm italic font-medium text-gray-700 relative">
                        <i className="fa-solid fa-quote-left mr-2 text-nung-blue/30"></i>
                        {def.example}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cultural Note */}
            {result.culturalNote && (
              <div className="bg-nung-green border-4 border-black p-8 shadow-brutal text-white relative group">
                <div className="absolute top-0 left-0 w-full h-full bg-fabric opacity-10 pointer-events-none"></div>
                <h3 className="text-2xl font-display font-bold text-nung-sand mb-6 border-b-2 border-white/30 pb-3 relative z-10">
                  🌿 Ghi chú văn hóa
                </h3>
                <div className="bg-white/10 backdrop-blur-sm p-6 border-2 border-dashed border-white/30 relative z-10">
                  <p className="leading-relaxed font-serif text-lg italic">
                    {result.culturalNote}
                  </p>
                </div>
                <div className="mt-8 text-right relative z-10">
                  <span className="font-hand text-4xl text-nung-sand -rotate-12 inline-block">
                    Bản sắc!
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Discussion Section */}
          <DiscussionSection
            originalText={inputText}
            targetLang={targetLang}
            user={user || null}
            result={result}
            onLoginRequired={() => {
              addToast("Vui lòng đăng nhập để tham gia thảo luận", "warning");
              if (setRoute) setRoute(AppRoute.LOGIN);
            }}
          />
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <div
          ref={historySectionRef}
          className="mt-20 pt-12 border-t-4 border-black animate-fade-in mb-12"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <div className="inline-block bg-nung-red text-white font-display font-bold text-2xl px-6 py-2 border-2 border-black shadow-brutal transform -rotate-1 mb-2">
                🕒 Lịch sử tra cứu
              </div>
              <p className="text-gray-600 font-serif font-bold text-sm ml-2">
                Các nội dung bạn đã tìm kiếm gần đây
              </p>
            </div>
            <button
              onClick={handleClearHistory}
              className="bg-white text-red-500 border-2 border-black px-4 py-2 font-bold hover:bg-red-500 hover:text-white hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all shadow-brutal-sm flex items-center gap-2"
            >
              <i className="fa-solid fa-trash-can"></i> Xóa tất cả
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
                    onClick={(e) => handleDeleteHistoryItem(e, item.id)}
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
