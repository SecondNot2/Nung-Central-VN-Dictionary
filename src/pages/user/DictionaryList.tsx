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
      <div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-bamboo-600 mb-4" />
          <p className="text-earth-600">Đang tải từ điển...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto px-4 py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-serif font-bold text-earth-900 mb-3">
          <i className="fa-solid fa-book-open mr-3 text-bamboo-600" />
          Tra cứu Từ điển
        </h1>
        <p className="text-earth-600 text-lg">
          Khám phá kho tàng ngôn ngữ Nùng và Miền Trung Việt Nam
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto mb-8">
        <div className="relative">
          <i className="fa-solid fa-search absolute left-5 top-1/2 -translate-y-1/2 text-earth-400 text-lg" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm từ tiếng Việt hoặc bản dịch..."
            className="w-full pl-14 pr-12 py-4 text-lg border-2 border-earth-200 rounded-2xl focus:ring-2 focus:ring-bamboo-500 focus:border-bamboo-500 outline-none transition-all bg-white shadow-sm hover:shadow-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600 transition-colors"
            >
              <i className="fa-solid fa-times-circle text-xl" />
            </button>
          )}
        </div>
      </div>

      {/* Language Tabs */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-earth-100 rounded-xl p-1.5">
          <button
            onClick={() => {
              setActiveTab("all");
              setActiveLetter(null);
            }}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "all"
                ? "bg-white text-earth-900 shadow-md"
                : "text-earth-600 hover:text-earth-800"
            }`}
          >
            <i className="fa-solid fa-globe mr-2" />
            Tất cả
            <span className="ml-2 text-xs bg-earth-200 text-earth-600 px-2 py-0.5 rounded-full">
              {counts.all}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab("nung");
              setActiveLetter(null);
            }}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "nung"
                ? "bg-white text-bamboo-700 shadow-md"
                : "text-earth-600 hover:text-earth-800"
            }`}
          >
            <i className="fa-solid fa-mountain mr-2" />
            Tiếng Nùng
            <span className="ml-2 text-xs bg-bamboo-100 text-bamboo-600 px-2 py-0.5 rounded-full">
              {counts.nung}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab("central");
              setActiveLetter(null);
            }}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "central"
                ? "bg-white text-earth-700 shadow-md"
                : "text-earth-600 hover:text-earth-800"
            }`}
          >
            <i className="fa-solid fa-wheat-awn mr-2" />
            Miền Trung
            <span className="ml-2 text-xs bg-earth-200 text-earth-600 px-2 py-0.5 rounded-full">
              {counts.central}
            </span>
          </button>
        </div>
      </div>

      {/* Alphabetical Index */}
      <div className="flex flex-wrap justify-center gap-1 mb-8 px-4">
        <button
          onClick={() => setActiveLetter(null)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
            activeLetter === null
              ? "bg-bamboo-600 text-white"
              : "bg-earth-100 text-earth-600 hover:bg-earth-200"
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
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
              activeLetter === letter
                ? "bg-bamboo-600 text-white"
                : "bg-earth-100 text-earth-600 hover:bg-earth-200"
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-earth-600">
          Tìm thấy <strong>{filteredEntries.length}</strong> từ
          {activeLetter && (
            <span>
              {" "}
              bắt đầu bằng "<strong>{activeLetter}</strong>"
            </span>
          )}
        </p>
        {(searchQuery || activeLetter) && (
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveLetter(null);
            }}
            className="text-bamboo-600 hover:text-bamboo-700 text-sm font-medium transition-colors"
          >
            <i className="fa-solid fa-refresh mr-1" />
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Dictionary Cards Grid */}
      {paginatedEntries.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-earth-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-search text-3xl text-earth-400" />
          </div>
          <h3 className="text-xl font-bold text-earth-800 mb-2">
            Không tìm thấy kết quả
          </h3>
          <p className="text-earth-500">
            Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {paginatedEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl border border-earth-200 shadow-sm hover:shadow-lg hover:border-bamboo-300 transition-all group cursor-pointer"
            >
              <div className="p-5">
                {/* Language Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                      entry.language === "nung"
                        ? "bg-bamboo-100 text-bamboo-700"
                        : "bg-earth-100 text-earth-700"
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

                  {/* Audio Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playPronunciation(entry);
                    }}
                    disabled={ttsLoading !== null}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      ttsLoading === entry.id
                        ? "bg-bamboo-100 text-bamboo-600"
                        : "bg-earth-100 text-earth-500 hover:bg-bamboo-100 hover:text-bamboo-600 group-hover:bg-bamboo-50"
                    }`}
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
                <h3 className="text-lg font-bold text-earth-900 mb-1 group-hover:text-bamboo-700 transition-colors">
                  {entry.word}
                </h3>

                {/* Translation */}
                <p className="text-xl font-serif text-bamboo-700 mb-2">
                  {entry.translation}
                </p>

                {/* Phonetic */}
                <p className="text-sm text-earth-500 italic mb-3">
                  /{entry.phonetic}/
                </p>

                {/* Example */}
                {entry.example && (
                  <div className="pt-3 border-t border-earth-100">
                    <p className="text-xs text-earth-400 mb-1">Ví dụ:</p>
                    <p className="text-sm text-earth-600 italic">
                      "{entry.example}"
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
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => {
              setCurrentPage((p) => Math.max(1, p - 1));
              containerRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            disabled={currentPage === 1}
            className={`w-10 h-10 rounded-full flex items-center justify-center border ${
              currentPage === 1
                ? "border-earth-200 text-earth-300 cursor-not-allowed"
                : "border-earth-300 text-earth-600 hover:bg-earth-50 hover:border-earth-400"
            }`}
          >
            <i className="fa-solid fa-chevron-left" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
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
                    <span className="text-earth-400">...</span>
                  )}
                  <button
                    onClick={() => {
                      setCurrentPage(page);
                      containerRef.current?.scrollIntoView({
                        behavior: "smooth",
                      });
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                      currentPage === page
                        ? "bg-bamboo-600 text-white"
                        : "text-earth-600 hover:bg-earth-100"
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
            className={`w-10 h-10 rounded-full flex items-center justify-center border ${
              currentPage === totalPages
                ? "border-earth-200 text-earth-300 cursor-not-allowed"
                : "border-earth-300 text-earth-600 hover:bg-earth-50 hover:border-earth-400"
            }`}
          >
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
      )}

      {/* Dictionary Stats */}
      <div className="mt-12 bg-gradient-to-r from-earth-100 to-bamboo-50 rounded-2xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-earth-900">{counts.all}</p>
            <p className="text-sm text-earth-600">Tổng số từ</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-bamboo-700">{counts.nung}</p>
            <p className="text-sm text-earth-600">Tiếng Nùng</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-earth-700">
              {counts.central}
            </p>
            <p className="text-sm text-earth-600">Tiếng Miền Trung</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-bamboo-600">2</p>
            <p className="text-sm text-earth-600">Ngôn ngữ</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DictionaryList;
