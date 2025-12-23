import React, { useState, useEffect, useMemo, useRef } from "react";
import { ToastContainer, useToast } from "../../components";
import { generateSpeech } from "../../services/ai/megaLlmService";
import {
  getDictionaryEntries,
  getDictionaryStats,
  type DictionaryEntry,
} from "../../services/dictionary/dictionaryDisplayService";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const DictionaryList: React.FC = () => {
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "nung" | "central">("all");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ttsLoading, setTtsLoading] = useState<string | null>(null);
  const itemsPerPage = 8;

  const containerRef = useRef<HTMLDivElement>(null);
  const { toasts, addToast, removeToast } = useToast();

  // Load dictionary data on mount
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      try {
        const data = getDictionaryEntries();
        setEntries(data);
      } catch (error) {
        console.error("Error loading dictionary:", error);
        addToast("Không thể tải từ điển", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        searchQuery === "" ||
        entry.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.phonetic.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab = activeTab === "all" || entry.language === activeTab;

      const matchesLetter =
        !activeLetter ||
        entry.word.charAt(0).toUpperCase() === activeLetter ||
        entry.translation.charAt(0).toUpperCase() === activeLetter;

      return matchesSearch && matchesTab && matchesLetter;
    });
  }, [entries, searchQuery, activeTab, activeLetter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, activeLetter]);

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Play pronunciation
  const playPronunciation = async (entry: DictionaryEntry) => {
    if (ttsLoading) return;
    setTtsLoading(entry.id);
    try {
      await generateSpeech(entry.phonetic || entry.translation, "Kore");
      addToast("Đang phát âm...", "info");
    } catch {
      addToast("Không thể phát âm lúc này", "error");
    } finally {
      setTtsLoading(null);
    }
  };

  // Get count for each tab
  const counts = useMemo(() => {
    return {
      all: entries.length,
      nung: entries.filter((e) => e.language === "nung").length,
      central: entries.filter((e) => e.language === "central").length,
    };
  }, [entries]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nung-sand bg-paper p-4">
        <div className="text-center bg-white border-4 border-black p-10 shadow-brutal rotate-1">
          <i className="fa-solid fa-circle-notch fa-spin text-5xl text-nung-red mb-6" />
          <p className="text-nung-dark font-black uppercase tracking-widest text-sm">
            Đang mở trang từ điển...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-nung-sand bg-paper py-12 px-4"
    >
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="text-center mb-16 relative">
        <div className="inline-block bg-white border-4 border-black p-8 shadow-brutal transform -rotate-1">
          <h1 className="text-5xl font-display font-black text-nung-dark mb-4 uppercase tracking-tighter">
            <i className="fa-solid fa-book-open mr-4 text-nung-red animate-bounce" />
            Tra cứu Từ điển
          </h1>
          <p className="text-gray-600 font-serif font-bold text-xl italic underline decoration-nung-red decoration-2 underline-offset-4">
            Khám phá kho tàng ngôn ngữ Nùng và phương ngữ đặc sắc
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto mb-12">
        <div className="relative group">
          <i className="fa-solid fa-search absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl transition-colors group-focus-within:text-nung-red" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo từ tiếng Việt hoặc bản dịch..."
            className="w-full pl-16 pr-14 py-5 text-xl border-4 border-black outline-none bg-white shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 focus:bg-nung-sand/10 transition-all font-bold"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-nung-red transition-colors"
            >
              <i className="fa-solid fa-times-circle text-2xl" />
            </button>
          )}
        </div>
      </div>

      {/* Language Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-10">
        <button
          onClick={() => {
            setActiveTab("all");
            setActiveLetter(null);
          }}
          className={`px-8 py-3 border-2 border-black font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
            activeTab === "all"
              ? "bg-black text-white shadow-none translate-x-1 translate-y-1"
              : "bg-white text-black shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          }`}
        >
          <i className="fa-solid fa-globe" />
          Tất cả
          <span
            className={`ml-1 text-[10px] px-2 py-0.5 border-2 border-black font-black ${
              activeTab === "all" ? "bg-white text-black" : "bg-gray-100"
            }`}
          >
            {counts.all}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab("nung");
            setActiveLetter(null);
          }}
          className={`px-8 py-3 border-2 border-black font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
            activeTab === "nung"
              ? "bg-nung-red text-white shadow-none translate-x-1 translate-y-1"
              : "bg-white text-nung-red shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          }`}
        >
          <i className="fa-solid fa-mountain" />
          Tiếng Nùng
          <span
            className={`ml-1 text-[10px] px-2 py-0.5 border-2 border-black font-black ${
              activeTab === "nung" ? "bg-white text-nung-red" : "bg-gray-100"
            }`}
          >
            {counts.nung}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab("central");
            setActiveLetter(null);
          }}
          className={`px-8 py-3 border-2 border-black font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
            activeTab === "central"
              ? "bg-nung-blue text-white shadow-none translate-x-1 translate-y-1"
              : "bg-white text-nung-blue shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          }`}
        >
          <i className="fa-solid fa-wheat-awn" />
          Miền Trung
          <span
            className={`ml-1 text-[10px] px-2 py-0.5 border-2 border-black font-black ${
              activeTab === "central"
                ? "bg-white text-nung-blue"
                : "bg-gray-100"
            }`}
          >
            {counts.central}
          </span>
        </button>
      </div>

      {/* Alphabetical Index */}
      <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-4xl mx-auto">
        <button
          onClick={() => setActiveLetter(null)}
          className={`w-12 h-12 border-2 border-black font-black transition-all flex items-center justify-center ${
            activeLetter === null
              ? "bg-black text-white shadow-none translate-x-1 translate-y-1"
              : "bg-white text-black shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          }`}
        >
          #
        </button>
        {ALPHABET.map((letter) => (
          <button
            key={letter}
            onClick={() =>
              setActiveLetter(activeLetter === letter ? null : letter)
            }
            className={`w-12 h-12 border-2 border-black font-black transition-all flex items-center justify-center ${
              activeLetter === letter
                ? "bg-nung-red text-white shadow-none translate-x-1 translate-y-1"
                : "bg-white text-black shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Results Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 px-4">
        <p className="text-nung-dark font-serif font-bold text-lg">
          Tìm thấy{" "}
          <span className="bg-nung-red text-white px-2 border-2 border-black rotate-2 inline-block mx-1">
            {filteredEntries.length}
          </span>{" "}
          kết quả phù hợp
          {activeLetter && (
            <span>
              {" "}
              với chữ "<strong>{activeLetter}</strong>"
            </span>
          )}
        </p>
        {(searchQuery || activeLetter) && (
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveLetter(null);
            }}
            className="px-4 py-2 bg-white border-2 border-black font-black uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <i className="fa-solid fa-refresh mr-2" />
            Xóa tất cả bộ lọc
          </button>
        )}
      </div>

      {/* Dictionary Cards Grid */}
      {paginatedEntries.length === 0 ? (
        <div className="text-center py-20 bg-white border-4 border-black border-dashed mx-4">
          <div className="w-24 h-24 bg-nung-sand border-2 border-black flex items-center justify-center mx-auto mb-6 rotate-12">
            <i className="fa-solid fa-search text-4xl text-gray-400" />
          </div>
          <h3 className="text-2xl font-display font-black text-nung-dark uppercase tracking-tighter mb-2">
            Không tìm thấy gì hết!
          </h3>
          <p className="text-gray-500 font-serif font-bold italic">
            Thử thay đổi từ khóa hoặc xóa bớt bộ lọc xem sao nhé
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {paginatedEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white border-4 border-black p-5 shadow-brutal-sm hover:shadow-brutal hover:-translate-x-1 hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden"
            >
              <div className="relative z-10">
                {/* Language Badge & Audio */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 border-2 border-black text-[10px] font-black uppercase tracking-widest ${
                      entry.language === "nung"
                        ? "bg-nung-red text-white"
                        : "bg-nung-blue text-white"
                    }`}
                  >
                    <i
                      className={`fa-solid ${
                        entry.language === "nung"
                          ? "fa-mountain"
                          : "fa-wheat-awn"
                      } mr-1`}
                    />
                    {entry.language === "nung" ? "Nùng" : "Miền Trung"}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playPronunciation(entry);
                    }}
                    disabled={ttsLoading !== null}
                    className={`w-10 h-10 border-2 border-black flex items-center justify-center transition-all ${
                      ttsLoading === entry.id
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-black hover:text-white"
                    } shadow-brutal-sm group-hover:shadow-none transition-all`}
                    title="Nghe phát âm"
                  >
                    {ttsLoading === entry.id ? (
                      <i className="fa-solid fa-circle-notch fa-spin text-sm" />
                    ) : (
                      <i className="fa-solid fa-volume-high text-sm" />
                    )}
                  </button>
                </div>

                {/* Word */}
                <h3 className="text-xl font-display font-black text-nung-dark mb-1 group-hover:text-nung-red transition-colors uppercase tracking-tighter">
                  {entry.word}
                </h3>

                {/* Translation */}
                <p className="text-2xl font-serif font-black text-nung-blue mb-2 decoration-nung-red/30 decoration-dotted underline underline-offset-4">
                  {entry.translation}
                </p>

                {/* Phonetic */}
                <p className="text-sm font-serif font-black text-nung-red mb-4 bg-nung-red/5 px-2 py-1 inline-block border border-nung-red/20 -rotate-1">
                  /{entry.phonetic}/
                </p>

                {/* Example */}
                {entry.example && (
                  <div className="pt-4 border-t-2 border-black border-dotted">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Ví dụ minh họa:
                    </p>
                    <p className="text-sm font-serif font-bold text-gray-700 italic leading-snug">
                      <i className="fa-solid fa-quote-left mr-1 text-nung-red/30" />
                      {entry.example}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-3 mt-8">
          <button
            onClick={() => {
              setCurrentPage((p) => Math.max(1, p - 1));
              containerRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            disabled={currentPage === 1}
            className={`w-12 h-12 border-2 border-black flex items-center justify-center transition-all ${
              currentPage === 1
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-white text-black shadow-brutal-sm hover:bg-black hover:text-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            }`}
          >
            <i className="fa-solid fa-chevron-left" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (totalPages <= 5) return true;
                if (page === 1 || page === totalPages) return true;
                if (Math.abs(page - currentPage) <= 1) return true;
                return false;
              })
              .map((page, idx, arr) => (
                <React.Fragment key={page}>
                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                    <span className="text-black font-black">...</span>
                  )}
                  <button
                    onClick={() => {
                      setCurrentPage(page);
                      containerRef.current?.scrollIntoView({
                        behavior: "smooth",
                      });
                    }}
                    className={`w-12 h-12 border-2 border-black font-black transition-all ${
                      currentPage === page
                        ? "bg-black text-white shadow-none translate-x-1 translate-y-1"
                        : "bg-white text-black shadow-brutal-sm hover:bg-black hover:text-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
          </div>

          <button
            onClick={() => {
              setCurrentPage((p) => Math.min(totalPages, p + 1));
              containerRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            disabled={currentPage === totalPages}
            className={`w-12 h-12 border-2 border-black flex items-center justify-center transition-all ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-white text-black shadow-brutal-sm hover:bg-black hover:text-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            }`}
          >
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
      )}

      {/* Dictionary Stats */}
      <div className="mt-20 bg-white border-4 border-black shadow-brutal p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-nung-red/5 -mr-16 -mt-16 rounded-full blur-2xl"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center relative z-10">
          <div className="group">
            <p className="text-5xl font-display font-black text-nung-dark mb-2 group-hover:text-nung-red transition-colors">
              {counts.all}
            </p>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
              Tổng kho từ
            </p>
          </div>
          <div className="group">
            <p className="text-5xl font-display font-black text-nung-red mb-2">
              {counts.nung}
            </p>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
              Tiếng Nùng
            </p>
          </div>
          <div className="group">
            <p className="text-5xl font-display font-black text-nung-blue mb-2">
              {counts.central}
            </p>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
              Phương ngữ
            </p>
          </div>
          <div className="group">
            <p className="text-5xl font-display font-black text-nung-dark mb-2 group-hover:rotate-12 transition-transform inline-block">
              2
            </p>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
              Hệ ngôn ngữ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DictionaryList;
