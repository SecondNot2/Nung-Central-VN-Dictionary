import React, { useState, useEffect } from "react";
import { User, AppRoute } from "../../types";
import {
  ToastContainer,
  useToast,
  ConfirmDialog,
  Pagination,
} from "../../components";
import {
  getSavedTranslations,
  deleteSavedTranslation,
  SavedTranslation,
} from "../../services/api/savedTranslationsService";
import {
  getUserSuggestions,
  deleteSuggestion,
  TranslationSuggestion,
} from "../../services/api/suggestionService";
import {
  supabase,
  isSupabaseConfigured,
} from "../../services/api/supabaseClient";

interface MyLibraryProps {
  user: User | null;
  setRoute?: (route: AppRoute) => void;
}

type TabType = "saved" | "suggestions" | "contributions";

interface Contribution {
  id: string;
  vietnamese_word: string;
  nung_word: string;
  phonetic?: string;
  meaning?: string;
  example?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

const MyLibrary: React.FC<MyLibraryProps> = ({ user, setRoute }) => {
  const { toasts, addToast, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("saved");
  const [loading, setLoading] = useState(true);

  // Data states
  const [savedTranslations, setSavedTranslations] = useState<
    SavedTranslation[]
  >([]);
  const [suggestions, setSuggestions] = useState<TranslationSuggestion[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      addToast("Vui lòng đăng nhập để xem thư viện", "warning");
      setRoute?.(AppRoute.LOGIN);
    }
  }, [user, setRoute]);

  // Fetch data based on active tab
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      setCurrentPage(1);

      switch (activeTab) {
        case "saved":
          const saved = await getSavedTranslations(user.id);
          setSavedTranslations(saved);
          break;
        case "suggestions":
          const sugs = await getUserSuggestions(user.id);
          setSuggestions(sugs);
          break;
        case "contributions":
          if (isSupabaseConfigured()) {
            const { data } = await supabase
              .from("contributions")
              .select("*")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false });
            setContributions(data || []);
          }
          break;
      }

      setLoading(false);
    };

    fetchData();
  }, [activeTab, user]);

  const handleDeleteSaved = async (id: string) => {
    const success = await deleteSavedTranslation(id);
    if (success) {
      setSavedTranslations((prev) => prev.filter((s) => s.id !== id));
      addToast("Đã xóa bản dịch đã lưu", "success");
    } else {
      addToast("Không thể xóa. Vui lòng thử lại.", "error");
    }
  };

  const handleDeleteSuggestion = async (id: string) => {
    const success = await deleteSuggestion(id);
    if (success) {
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
      addToast("Đã xóa đề xuất", "success");
    } else {
      addToast("Không thể xóa. Vui lòng thử lại.", "error");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-amber-400 text-black border-2 border-black shadow-brutal-sm">
            Đang chờ
          </span>
        );
      case "approved":
        return (
          <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-nung-green text-white border-2 border-black shadow-brutal-sm">
            Đã duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-nung-red text-white border-2 border-black shadow-brutal-sm">
            Từ chối
          </span>
        );
      default:
        return null;
    }
  };

  // Paginated data
  const getPaginatedData = () => {
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;

    switch (activeTab) {
      case "saved":
        return savedTranslations.slice(start, end);
      case "suggestions":
        return suggestions.slice(start, end);
      case "contributions":
        return contributions.slice(start, end);
      default:
        return [];
    }
  };

  const getTotalItems = () => {
    switch (activeTab) {
      case "saved":
        return savedTranslations.length;
      case "suggestions":
        return suggestions.length;
      case "contributions":
        return contributions.length;
      default:
        return 0;
    }
  };

  if (!user) return null;

  const tabs = [
    {
      id: "saved" as TabType,
      label: "Bản dịch đã lưu",
      icon: "fa-bookmark",
      count: savedTranslations.length,
    },
    {
      id: "suggestions" as TabType,
      label: "Đề xuất chỉnh sửa",
      icon: "fa-pen-to-square",
      count: suggestions.length,
    },
    {
      id: "contributions" as TabType,
      label: "Đóng góp từ vựng",
      icon: "fa-plus-circle",
      count: contributions.length,
    },
  ];

  return (
    <div className="min-h-screen bg-nung-sand bg-paper py-12 px-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12 relative">
          <div className="inline-block bg-white border-4 border-black p-8 shadow-brutal transform -rotate-1">
            <h1 className="text-5xl font-display font-black text-nung-dark mb-4 uppercase tracking-tighter flex items-center gap-4">
              <div className="w-16 h-16 bg-nung-red text-white border-4 border-black flex items-center justify-center shadow-brutal-sm rotate-3 group-hover:rotate-0 transition-transform">
                <i className="fa-solid fa-folder-open text-3xl" />
              </div>
              Thư viện của tôi
            </h1>
            <p className="text-gray-600 font-serif font-bold text-lg italic underline decoration-nung-blue decoration-2 underline-offset-4">
              Quản lý bản dịch đã lưu, đề xuất chỉnh sửa và đóng góp của bạn
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-4 border-black shadow-brutal mb-12 relative overflow-hidden">
          <div className="border-b-4 border-black bg-nung-sand/10">
            <div className="flex flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-8 py-5 font-black uppercase tracking-widest transition-all relative border-r-4 border-black last:border-r-0 ${
                    activeTab === tab.id
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-nung-sand"
                  }`}
                >
                  <i
                    className={`fa-solid ${tab.icon} ${
                      activeTab === tab.id ? "text-nung-red" : "text-gray-400"
                    }`}
                  />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black border-2 border-black ${
                        activeTab === tab.id
                          ? "bg-white text-black"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-white border-4 border-black h-24 shadow-brutal-sm"
                  />
                ))}
              </div>
            ) : getPaginatedData().length === 0 ? (
              <div className="text-center py-20 bg-nung-sand/5 border-4 border-black border-dashed mx-4">
                <i
                  className={`fa-solid ${
                    tabs.find((t) => t.id === activeTab)?.icon
                  } text-6xl mb-6 block text-gray-200 rotate-12`}
                />
                <h3 className="text-2xl font-display font-black text-nung-dark uppercase tracking-tighter mb-4">
                  {activeTab === "saved" && "Chưa có gì được lưu giữ!"}
                  {activeTab === "suggestions" && "Đang trống trơn bạn ơi!"}
                  {activeTab === "contributions" &&
                    "Chưa tìm thấy đóng góp nào!"}
                </h3>
                <p className="text-gray-500 font-serif font-bold italic max-w-md mx-auto">
                  {activeTab === "saved" &&
                    "Hãy lưu lại những bản dịch tâm đắc bằng cách nhấn nút Tim trong kết quả tìm kiếm nhé."}
                  {activeTab === "suggestions" &&
                    "Nếu thấy từ nào chưa chuẩn, hãy mạnh dạn đề xuất chỉnh sửa để cộng đồng cùng hoàn thiện."}
                  {activeTab === "contributions" &&
                    "Mỗi từ mới bạn đóng góp là một di sản cho mai sau. Bắt đầu ngay thôi!"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Saved Translations */}
                {activeTab === "saved" &&
                  (getPaginatedData() as SavedTranslation[]).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-6 p-6 bg-white border-4 border-black shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group relative"
                    >
                      <div className="w-14 h-14 border-4 border-black bg-nung-red text-white flex items-center justify-center flex-shrink-0 shadow-brutal-sm -rotate-3 group-hover:rotate-0 transition-transform">
                        <i className="fa-solid fa-heart text-2xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 border border-black/5">
                            GỐC: {item.original_text}
                          </span>
                        </div>
                        <p className="text-2xl font-display font-black text-nung-dark mb-1">
                          {item.result?.translations?.[0]?.script || ""}
                        </p>
                        <p className="text-lg font-serif font-black text-nung-red italic flex items-center gap-2">
                          <i className="fa-solid fa-volume-high text-sm"></i>
                          {item.result?.translations?.[0]?.phonetic
                            ? `/${item.result.translations[0].phonetic}/`
                            : ""}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <i className="fa-solid fa-calendar-days"></i>
                          {formatDate(item.created_at)}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setConfirmDialog({
                            isOpen: true,
                            title: "Xóa bản dịch này?",
                            message:
                              "Bản dịch này sẽ bị xóa khỏi thư viện của bạn.",
                            onConfirm: () => handleDeleteSaved(item.id),
                          })
                        }
                        className="absolute -top-3 -right-3 w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-black hover:bg-nung-red hover:text-white shadow-brutal-sm group-hover:opacity-100 sm:opacity-0 transition-all rotate-12 hover:rotate-0"
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
                  ))}

                {/* Suggestions */}
                {activeTab === "suggestions" &&
                  (getPaginatedData() as TranslationSuggestion[]).map(
                    (item) => (
                      <div
                        key={item.id}
                        className="p-6 bg-white border-4 border-black shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group relative"
                      >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-4">
                              {getStatusBadge(item.status)}
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1">
                                <i className="fa-solid fa-clock mr-1"></i>
                                {formatDate(item.created_at)}
                              </span>
                            </div>
                            <div className="bg-nung-sand/10 border-2 border-black p-4 mb-4 transform -rotate-1">
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                                Cụm từ gốc:
                              </p>
                              <p className="text-xl font-display font-black text-nung-dark">
                                {item.original_text}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                              <div className="p-3 border-2 border-black border-dashed bg-gray-50 flex items-center gap-3">
                                <i className="fa-solid fa-xmark text-nung-red"></i>
                                <span className="text-gray-400 line-through font-serif font-bold">
                                  {item.original_translation}
                                </span>
                              </div>
                              <div className="p-3 border-2 border-black bg-nung-blue/5 flex items-center gap-3 shadow-brutal-sm">
                                <i className="fa-solid fa-check text-nung-blue"></i>
                                <span className="text-nung-blue font-display font-black text-lg">
                                  {item.suggested_translation}
                                </span>
                              </div>
                            </div>

                            {item.reason && (
                              <div className="mt-6 p-4 bg-paper border-2 border-black relative">
                                <i className="fa-solid fa-quote-left absolute -top-3 -left-2 text-2xl text-nung-red/20" />
                                <p className="text-sm font-serif font-bold text-gray-600 italic">
                                  {item.reason}
                                </p>
                              </div>
                            )}
                          </div>
                          {item.status === "pending" && (
                            <button
                              onClick={() =>
                                setConfirmDialog({
                                  isOpen: true,
                                  title: "Xóa đề xuất này?",
                                  message:
                                    "Đề xuất này sẽ không còn tồn tại trên hệ thống.",
                                  onConfirm: () =>
                                    handleDeleteSuggestion(item.id),
                                })
                              }
                              className="absolute -top-3 -right-3 w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-black hover:bg-nung-red hover:text-white shadow-brutal-sm group-hover:opacity-100 sm:opacity-0 transition-all rotate-12 hover:rotate-0"
                            >
                              <i className="fa-solid fa-trash" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  )}

                {/* Contributions */}
                {activeTab === "contributions" &&
                  (getPaginatedData() as Contribution[]).map((item) => (
                    <div
                      key={item.id}
                      className="p-6 bg-white border-4 border-black shadow-brutal-sm hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal transition-all group relative"
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-4">
                            {getStatusBadge(item.status)}
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1">
                              <i className="fa-solid fa-clock mr-1"></i>
                              {formatDate(item.created_at)}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                            <div className="bg-paper p-4 border-2 border-black rotate-1">
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                                Tiếng Việt:
                              </p>
                              <span className="text-2xl font-display font-black text-nung-dark">
                                {item.vietnamese_word}
                              </span>
                            </div>
                            <div className="bg-white p-4 border-2 border-black -rotate-1 shadow-brutal-sm">
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                                Tiếng Nùng:
                              </p>
                              <span className="text-2xl font-display font-black text-nung-blue">
                                {item.nung_word}
                              </span>
                              {item.phonetic && (
                                <p className="text-sm font-serif font-black text-nung-red mt-2 italic">
                                  /{item.phonetic}/
                                </p>
                              )}
                            </div>
                          </div>

                          {(item.meaning || item.example) && (
                            <div className="mt-6 space-y-3 bg-nung-sand/5 p-4 border-2 border-black border-dotted">
                              {item.meaning && (
                                <p className="text-sm font-serif font-bold text-gray-700 leading-relaxed">
                                  <span className="font-black uppercase text-[10px] tracking-widest text-gray-400 block mb-1">
                                    Giải nghĩa:
                                  </span>
                                  {item.meaning}
                                </p>
                              )}
                              {item.example && (
                                <p className="text-sm font-serif font-bold text-gray-600 italic border-t border-black/10 pt-3">
                                  <span className="font-black uppercase text-[10px] tracking-widest text-gray-400 block mb-1">
                                    Ví dụ:
                                  </span>
                                  <i className="fa-solid fa-quote-left mr-2 text-nung-red/30"></i>
                                  {item.example}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Pagination */}
            {getTotalItems() > perPage && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalItems={getTotalItems()}
                  itemsPerPage={perPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  );
};

export default MyLibrary;
