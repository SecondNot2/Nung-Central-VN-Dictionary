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
      label: "Tiếng phổ thông",
      shortLabel: "Phổ thông",
      icon: "fa-flag",
      description: "Ngôn ngữ phổ thông",
    },
    {
      value: "nung",
      label: "Tiếng Nùng (Lạng Sơn)",
      shortLabel: "Nùng",
      icon: "fa-mountain",
      description: "Dân tộc Nùng",
    },
    {
      value: "central",
      label: "Phương ngữ miền Trung",
      shortLabel: "Miền Trung",
      icon: "fa-wheat-awn",
      description: "Phương ngữ miền Trung",
    },
  ];

  const allTargetLanguageOptions: SelectOption[] = [
    {
      value: "nung",
      label: "Tiếng Nùng (Lạng Sơn)",
      shortLabel: "Nùng",
      icon: "fa-mountain",
      description: "Dân tộc Nùng",
    },
    {
      value: "central",
      label: "Phương ngữ miền Trung",
      shortLabel: "Miền Trung",
      icon: "fa-wheat-awn",
      description: "Phương ngữ miền Trung",
    },
    {
      value: "vi",
      label: "Tiếng phổ thông",
      shortLabel: "Phổ thông",
      icon: "fa-flag",
      description: "Ngôn ngữ phổ thông",
    },
    {
      value: "all",
      label: "Cả hai (Nùng & MT)",
      shortLabel: "Tất cả",
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

      <div className="text-center mb-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-12 bg-nung-sand/40 -rotate-1 skew-x-12 blur-xl -z-10"></div>
        <h1 className="text-3xl md:text-6xl font-bold text-black mb-2 tracking-tight">
          Từ điển{" "}
          <span className="bg-nung-red text-white px-3 py-0.5 border-2 border-black inline-block transform rotate-1 shadow-brutal-sm ">
            Nùng
          </span>{" "}
          & Miền Trung
        </h1>
        <p className="text-gray-400 font-bold text-xs md:text-lg uppercase tracking-[0.2em] mt-4 md:mt-6">
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

      {/* Input Section (Lite) */}
      <div className="bg-white border-2 border-black shadow-brutal-sm p-4 md:p-8 mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-nung-red/5 -mr-8 -mt-8 transform rotate-45"></div>

        {/* Global Language Selection Container */}
        <div className="mb-6">
          {/* Desktop Layout (Standard) */}
          <div className="hidden md:flex flex-row gap-6 items-end">
            <div className="flex-1">
              <CustomSelect
                value={sourceLang}
                onChange={setSourceLang}
                options={sourceLanguageOptions}
                label="Ngôn ngữ nguồn"
              />
            </div>
            <div className="pb-2">
              <button
                type="button"
                onClick={handleSwapLanguages}
                disabled={targetLang === "all"}
                className={`w-12 h-12 border-2 border-black flex items-center justify-center transition-all shadow-brutal-sm ${
                  targetLang === "all"
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-white text-black hover:bg-black hover:text-white"
                }`}
                title="Hoán đổi ngôn ngữ"
              >
                <i className="fa-solid fa-right-left"></i>
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

          {/* Mobile Layout (Compact) */}
          <div className="flex md:hidden flex-col gap-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Nguồn
              </span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                Đích
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CustomSelect
                value={sourceLang}
                onChange={setSourceLang}
                options={sourceLanguageOptions}
                label="Nguồn"
                hideLabel
                isCompact
              />
              <button
                type="button"
                onClick={handleSwapLanguages}
                disabled={targetLang === "all"}
                className={`w-10 h-10 border-2 border-black flex items-center justify-center shrink-0 transition-all shadow-brutal-sm ${
                  targetLang === "all"
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed shadow-none"
                    : "bg-white text-black active:bg-black active:text-white"
                }`}
              >
                <i className="fa-solid fa-repeat text-sm"></i>
              </button>
              <CustomSelect
                value={targetLang}
                onChange={setTargetLang}
                options={getFilteredTargetOptions()}
                label="Đích"
                hideLabel
                isCompact
              />
            </div>
          </div>
        </div>

        <div className="relative">
          <textarea
            className="w-full p-4 md:p-6 border-2 border-black font-medium text-lg md:text-xl outline-none transition-all min-h-[140px] md:min-h-[160px] bg-gray-50 text-black placeholder-gray-400 focus:bg-white"
            placeholder="Nhập nội dung cần tra cứu..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            spellCheck={false}
          />

          {/* Spell Check Suggestion */}
          {spellingSuggestion && (
            <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-10 bg-white border-2 border-black px-3 py-1.5 md:px-4 md:py-2 shadow-brutal-sm animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center gap-2 md:gap-3">
              <span className="text-gray-400 text-[10px] md:text-sm font-black uppercase tracking-widest">
                Gợi ý:
              </span>
              <button
                onClick={applySuggestion}
                className="text-nung-red font-bold hover:underline transition-all text-sm md:text-base"
              >
                {spellingSuggestion}
              </button>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleTranslate}
              disabled={loading || !inputText.trim()}
              className={`group flex items-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 border-2 border-black font-black text-sm md:text-xl uppercase tracking-widest transition-all shadow-brutal-sm ${
                loading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-black text-white hover:bg-nung-red hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
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

      {/* Error Alert (Lite) */}
      {error && (
        <div className="bg-red-50 border-2 border-black text-red-700 p-4 mb-8 shadow-brutal-sm flex items-start animate-in slide-in-from-top-2">
          <i className="fa-solid fa-triangle-exclamation mt-1 mr-3"></i>
          <div>
            <p className="font-black uppercase text-xs tracking-widest mb-1">
              Đã xảy ra lỗi
            </p>
            <p className="font-medium text-sm italic">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton (Lite) */}
      {loading && !result && (
        <div className="space-y-8 animate-pulse">
          <div className="bg-white border-2 border-black shadow-brutal-sm p-8">
            <div className="h-8 bg-gray-100 border-2 border-black w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-20 bg-gray-50 border-2 border-black"></div>
              <div className="h-20 bg-gray-50 border-2 border-black"></div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section (Lite) */}
      {result && !loading && (
        <div className="space-y-12 mb-20">
          {/* Translation Cards */}
          <div className="grid grid-cols-1 gap-8">
            {result.translations.map((trans, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-black shadow-brutal-sm relative group animate-in fade-in zoom-in duration-300"
              >
                <div className="bg-gray-50 border-b-2 border-black px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">
                      {trans.language}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
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
                      className="bg-white text-black px-4 py-2 border-2 border-black font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
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

                <div className="p-8 grid gap-8 md:grid-cols-2">
                  <div className="col-span-1 p-6 bg-white border-2 border-black shadow-brutal-sm">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
                      Văn bản gốc / Chữ viết
                    </label>
                    <p className="text-3xl font-black break-words leading-tight">
                      {trans.script}
                    </p>
                  </div>
                  <div className="col-span-1 p-6 bg-gray-50 border-2 border-black shadow-brutal-sm">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
                      Phiên âm / Cách đọc
                    </label>
                    <p className="text-xl text-nung-red italic font-bold break-words">
                      {trans.phonetic || "Chưa có phiên âm"}
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
              <div className="bg-white border-2 border-black p-8 shadow-brutal-sm relative">
                <h3 className="text-xl font-black uppercase tracking-tight mb-6 border-b-2 border-black pb-3">
                  📖 Định nghĩa
                </h3>
                <ul className="space-y-6">
                  {result.definitions.map((def, idx) => (
                    <li key={idx} className="group">
                      <span className="font-bold text-nung-red text-xl block mb-1 group-hover:translate-x-1 transition-transform">
                        {def.word}
                      </span>
                      <p className="text-black font-medium mb-3 italic">
                        {def.definition}
                      </p>
                      <div className="bg-gray-50 p-4 border-2 border-black text-sm italic font-medium text-gray-600">
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

      {/* History Section (Lite) */}
      {history.length > 0 && (
        <div
          ref={historySectionRef}
          className="mt-20 pt-12 border-t-2 border-black mb-12"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <div className="bg-black text-white px-6 py-2 border-2 border-black shadow-brutal-sm mb-4 inline-block">
                <h2 className="text-xl font-black uppercase tracking-tight">
                  🕒 Lịch sử tra cứu
                </h2>
              </div>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest ml-1">
                Các nội dung bạn đã tìm kiếm gần đây
              </p>
            </div>
            <button
              onClick={handleClearHistory}
              className="bg-white text-red-500 border-2 border-black px-4 py-2 font-black uppercase text-[10px] tracking-widest shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2"
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
                  className="bg-white border-2 border-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none cursor-pointer transition-all group relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row h-full">
                    {/* Source Side */}
                    <div className="flex-1 p-4 border-b-2 md:border-b-0 md:border-r-2 border-black bg-gray-50/50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {item.sourceLang === "vi"
                            ? "Tiếng Việt"
                            : item.sourceLang === "nung"
                            ? "Tiếng Nùng"
                            : "Nghệ An/Hà Tĩnh"}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">
                          {new Date(item.timestamp).toLocaleTimeString(
                            "vi-VN",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      </div>
                      <p className="text-black font-bold break-words">
                        {item.original}
                      </p>
                    </div>

                    {/* Target Side */}
                    <div className="flex-1 p-4 bg-white pr-12">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-nung-red uppercase tracking-widest">
                          {item.targetLang === "nung"
                            ? "Tiếng Nùng"
                            : item.targetLang === "central"
                            ? "Nghệ An/Hà Tĩnh"
                            : item.targetLang === "vi"
                            ? "Tiếng Việt"
                            : "Tất cả"}
                        </span>
                      </div>
                      <p className="text-black break-words">
                        {item.result.translations[0]?.script}
                      </p>
                    </div>
                  </div>

                  {/* Delete Button (Hover) */}
                  <button
                    onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                    className="absolute top-1/2 -translate-y-1/2 right-4 p-2 text-gray-300 hover:text-nung-red transition-all md:opacity-0 group-hover:opacity-100"
                    title="Xóa mục này"
                  >
                    <i className="fa-solid fa-xmark text-lg"></i>
                  </button>
                </div>
              ))}
          </div>

          {/* Pagination Controls (Lite) */}
          {history.length > itemsPerPage && (
            <div className="flex justify-center items-center mt-10 space-x-4">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  historySectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                disabled={currentPage === 1}
                className={`w-10 h-10 border-2 border-black flex items-center justify-center transition-all ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-white text-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5"
                }`}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>

              <span className="text-[10px] font-black uppercase tracking-widest text-black">
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
                className={`w-10 h-10 border-2 border-black flex items-center justify-center transition-all ${
                  currentPage === Math.ceil(history.length / itemsPerPage)
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-white text-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5"
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
