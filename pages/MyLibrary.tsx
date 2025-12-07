import React, { useState, useEffect } from "react";
import { User, AppRoute } from "../types";
import {
  ToastContainer,
  useToast,
  ConfirmDialog,
  Pagination,
} from "../components";
import {
  getSavedTranslations,
  deleteSavedTranslation,
  SavedTranslation,
} from "../services/savedTranslationsService";
import {
  getUserSuggestions,
  deleteSuggestion,
  TranslationSuggestion,
} from "../services/suggestionService";
import { supabase, isSupabaseConfigured } from "../services/supabaseClient";

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
          <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
            Đang chờ
          </span>
        );
      case "approved":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            Đã duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
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
    <div className="min-h-screen bg-gradient-to-br from-earth-50 via-white to-bamboo-50 py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-earth-900 mb-2">
            <i className="fa-solid fa-folder-open mr-3 text-bamboo-600" />
            Thư viện của tôi
          </h1>
          <p className="text-earth-600">
            Quản lý các bản dịch đã lưu, đề xuất chỉnh sửa và đóng góp của bạn
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-earth-200">
            <div className="flex flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "text-bamboo-600 bg-bamboo-50"
                      : "text-earth-500 hover:text-earth-700 hover:bg-earth-50"
                  }`}
                >
                  <i className={`fa-solid ${tab.icon}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        activeTab === tab.id
                          ? "bg-bamboo-600 text-white"
                          : "bg-earth-200 text-earth-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-bamboo-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-earth-100 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : getPaginatedData().length === 0 ? (
              <div className="text-center py-16 text-earth-400">
                <i
                  className={`fa-solid ${
                    tabs.find((t) => t.id === activeTab)?.icon
                  } text-5xl mb-4 block opacity-50`}
                />
                <p className="text-lg">
                  {activeTab === "saved" && "Chưa có bản dịch nào được lưu"}
                  {activeTab === "suggestions" &&
                    "Chưa có đề xuất chỉnh sửa nào"}
                  {activeTab === "contributions" &&
                    "Chưa có đóng góp từ vựng nào"}
                </p>
                <p className="text-sm mt-2">
                  {activeTab === "saved" &&
                    "Lưu bản dịch bằng cách nhấn nút bookmark trong kết quả dịch"}
                  {activeTab === "suggestions" &&
                    'Đề xuất chỉnh sửa bản dịch bằng cách nhấn "Đề xuất chỉnh sửa"'}
                  {activeTab === "contributions" &&
                    'Đóng góp từ vựng mới trong phần "Đóng góp"'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Saved Translations */}
                {activeTab === "saved" &&
                  (getPaginatedData() as SavedTranslation[]).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 bg-earth-50 rounded-xl hover:bg-earth-100 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-bamboo-100 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-bookmark text-bamboo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-earth-500 text-sm mb-1">
                          {item.original_text}
                        </p>
                        <p className="text-earth-900 font-semibold">
                          {item.result?.translations?.[0]?.script || ""}
                        </p>
                        <p className="text-bamboo-600 text-sm italic">
                          {item.result?.translations?.[0]?.phonetic || ""}
                        </p>
                        <p className="text-earth-400 text-xs mt-2">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setConfirmDialog({
                            isOpen: true,
                            title: "Xóa bản dịch đã lưu?",
                            message: "Bạn có chắc chắn muốn xóa bản dịch này?",
                            onConfirm: () => handleDeleteSaved(item.id),
                          })
                        }
                        className="opacity-0 group-hover:opacity-100 p-2 text-earth-400 hover:text-red-500 transition-all"
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
                        className="p-4 bg-earth-50 rounded-xl hover:bg-earth-100 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusBadge(item.status)}
                              <span className="text-earth-400 text-xs">
                                {formatDate(item.created_at)}
                              </span>
                            </div>
                            <p className="text-earth-500 text-sm mb-1">
                              <span className="font-medium">Văn bản gốc:</span>{" "}
                              {item.original_text}
                            </p>
                            <div className="flex items-center gap-2 text-sm mt-2">
                              <span className="text-earth-500 line-through">
                                {item.original_translation}
                              </span>
                              <i className="fa-solid fa-arrow-right text-earth-400" />
                              <span className="text-bamboo-700 font-medium">
                                {item.suggested_translation}
                              </span>
                            </div>
                            {item.reason && (
                              <p className="text-earth-500 text-sm mt-2 italic">
                                <i className="fa-solid fa-quote-left text-earth-300 mr-1" />
                                {item.reason}
                              </p>
                            )}
                          </div>
                          {item.status === "pending" && (
                            <button
                              onClick={() =>
                                setConfirmDialog({
                                  isOpen: true,
                                  title: "Xóa đề xuất?",
                                  message:
                                    "Bạn có chắc chắn muốn xóa đề xuất này?",
                                  onConfirm: () =>
                                    handleDeleteSuggestion(item.id),
                                })
                              }
                              className="opacity-0 group-hover:opacity-100 p-2 text-earth-400 hover:text-red-500 transition-all"
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
                      className="p-4 bg-earth-50 rounded-xl hover:bg-earth-100 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(item.status)}
                            <span className="text-earth-400 text-xs">
                              {formatDate(item.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-earth-700 font-medium">
                              {item.vietnamese_word}
                            </span>
                            <i className="fa-solid fa-arrow-right text-earth-400" />
                            <span className="text-bamboo-700 font-bold">
                              {item.nung_word}
                            </span>
                            {item.phonetic && (
                              <span className="text-bamboo-500 text-sm italic">
                                ({item.phonetic})
                              </span>
                            )}
                          </div>
                          {item.meaning && (
                            <p className="text-earth-600 text-sm mt-1">
                              {item.meaning}
                            </p>
                          )}
                          {item.example && (
                            <p className="text-earth-500 text-sm mt-1 italic">
                              Ví dụ: {item.example}
                            </p>
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
