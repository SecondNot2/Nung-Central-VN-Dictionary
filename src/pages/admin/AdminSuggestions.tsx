import React, { useState, useEffect } from "react";
import { User, AppRoute } from "../../types";
import {
  ToastContainer,
  useToast,
  ConfirmDialog,
  Pagination,
} from "../../components";
import {
  getPendingSuggestions,
  reviewSuggestion,
  TranslationSuggestion,
} from "../../services/api/suggestionService";
import {
  supabase,
  isSupabaseConfigured,
} from "../../services/api/supabaseClient";

interface AdminSuggestionsProps {
  user: User | null;
  setRoute: (route: AppRoute) => void;
}

type FilterType = "all" | "pending" | "approved" | "rejected";

const AdminSuggestions: React.FC<AdminSuggestionsProps> = ({
  user,
  setRoute,
}) => {
  const { toasts, addToast, removeToast } = useToast();
  const [suggestions, setSuggestions] = useState<TranslationSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: "approved" | "rejected";
    suggestionId: string;
  } | null>(null);

  const perPage = 10;

  // Check admin access
  useEffect(() => {
    if (!user || user.role !== "admin") {
      addToast("Bạn không có quyền truy cập trang này", "error");
      setRoute(AppRoute.DICTIONARY);
    }
  }, [user, setRoute]);

  // Fetch suggestions
  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchSuggestions = async () => {
      setLoading(true);

      if (!isSupabaseConfigured()) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from("translation_suggestions")
          .select("*")
          .order("created_at", { ascending: false });

        if (filter !== "all") {
          query = query.eq("status", filter);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching suggestions:", error);
          addToast("Không thể tải danh sách đề xuất", "error");
        } else {
          setSuggestions(data || []);
        }
      } catch (err) {
        console.error("Error:", err);
      }

      setLoading(false);
    };

    fetchSuggestions();
  }, [user, filter]);

  const handleReview = async (
    suggestionId: string,
    status: "approved" | "rejected"
  ) => {
    if (!user) return;

    setProcessingId(suggestionId);
    const success = await reviewSuggestion(suggestionId, user.id, status);

    if (success) {
      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestionId
            ? {
                ...s,
                status,
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
              }
            : s
        )
      );
      addToast(
        status === "approved" ? "Đã phê duyệt đề xuất" : "Đã từ chối đề xuất",
        "success"
      );
    } else {
      addToast("Không thể xử lý đề xuất. Vui lòng thử lại.", "error");
    }

    setProcessingId(null);
    setConfirmDialog(null);
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
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-amber-400 text-black border-2 border-black shadow-brutal-sm">
            CHỜ XÉT DUYỆT
          </span>
        );
      case "approved":
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-green-400 text-black border-2 border-black shadow-brutal-sm">
            ĐÃ PHÊ DUYỆT
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-nung-red text-white border-2 border-black">
            BỊ TỪ CHỐI
          </span>
        );
      default:
        return null;
    }
  };

  // Pagination
  const paginatedSuggestions = suggestions.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const counts = {
    all: suggestions.length,
    pending: suggestions.filter((s) => s.status === "pending").length,
    approved: suggestions.filter((s) => s.status === "approved").length,
    rejected: suggestions.filter((s) => s.status === "rejected").length,
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="bg-white text-black">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header Container */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white border-2 border-black p-6 shadow-brutal-sm">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">
              Đề xuất hiệu đính
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-1">
              Quản lý các đề xuất sửa đổi bản dịch từ cộng đồng
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-nung-blue text-white border-2 border-black px-4 py-2 font-bold uppercase tracking-widest text-[10px] shadow-brutal-sm">
              {counts.pending} ĐANG CHỜ
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border-2 border-black p-6 shadow-brutal-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-filter" /> Tiến độ xét duyệt
            </p>
            <div className="space-y-2">
              {[
                {
                  id: "pending" as FilterType,
                  label: "Đang chờ duyệt",
                  count: counts.pending,
                  icon: "fa-hourglass-half",
                },
                {
                  id: "approved" as FilterType,
                  label: "Đã phê chuẩn",
                  count: counts.approved,
                  icon: "fa-certificate",
                },
                {
                  id: "rejected" as FilterType,
                  label: "Đã bác bỏ",
                  count: counts.rejected,
                  icon: "fa-file-circle-xmark",
                },
                {
                  id: "all" as FilterType,
                  label: "Tất cả đề xuất",
                  count: counts.all,
                  icon: "fa-layer-group",
                },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setFilter(f.id);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-4 py-3 border-2 border-black font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-between ${
                    filter === f.id
                      ? "bg-black text-white shadow-none"
                      : "bg-white text-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <i className={`fa-solid ${f.icon} text-xs`} />
                    {f.label}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 border-2 border-black text-[8px] ${
                      filter === f.id
                        ? "bg-white text-black"
                        : "bg-gray-100 text-black"
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Suggestions List */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white border-2 border-black p-8 shadow-brutal-sm"
                >
                  <div className="h-4 w-1/4 bg-gray-100 mb-4" />
                  <div className="h-8 w-full bg-gray-100" />
                </div>
              ))}
            </div>
          ) : paginatedSuggestions.length === 0 ? (
            <div className="bg-white border-2 border-black p-16 text-center shadow-brutal-sm">
              <p className="text-xl font-bold uppercase tracking-tight text-gray-400">
                Không có đề xuất nào
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="bg-white border-2 border-black p-6 shadow-brutal-sm transition-all group"
                >
                  <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-3 mb-6">
                        {getStatusBadge(suggestion.status)}
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          {formatDate(suggestion.created_at)}
                        </span>
                      </div>

                      {/* Word Card */}
                      <div className="mb-6">
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                          Từ / Cụm từ gốc (Nùng):
                        </span>
                        <h3 className="text-2xl font-bold uppercase tracking-tight group-hover:text-nung-blue transition-colors">
                          {suggestion.original_text}
                        </h3>
                      </div>

                      {/* Comparison Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 relative">
                        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 border-2 border-black bg-white items-center justify-center shadow-brutal-sm">
                          <i className="fa-solid fa-right-long text-black" />
                        </div>

                        <div className="p-4 bg-gray-50 border-2 border-black">
                          <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                            Bản dịch hiện tại:
                          </span>
                          <p className="text-black font-medium italic line-through opacity-50">
                            {suggestion.original_translation}
                          </p>
                        </div>

                        <div className="p-4 bg-white border-2 border-black shadow-brutal-sm">
                          <span className="text-[8px] font-black uppercase tracking-widest text-nung-blue mb-2 block">
                            Đề xuất thay thế:
                          </span>
                          <p className="text-black font-bold italic text-lg">
                            {suggestion.suggested_translation}
                          </p>
                        </div>
                      </div>

                      {/* Reason */}
                      {suggestion.reason && (
                        <div className="p-4 bg-amber-50 border-2 border-black">
                          <span className="text-[8px] font-black uppercase tracking-widest text-amber-600 block mb-1">
                            Lý do đề xuất:
                          </span>
                          <p className="text-xs font-medium italic text-amber-900 leading-relaxed">
                            {suggestion.reason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {suggestion.status === "pending" && (
                      <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto self-start">
                        <button
                          onClick={() =>
                            setConfirmDialog({
                              isOpen: true,
                              title: "Phê duyệt thay đổi?",
                              message:
                                "Thay thế bản dịch hiện tại bằng đề xuất này.",
                              action: "approved",
                              suggestionId: suggestion.id,
                            })
                          }
                          disabled={processingId === suggestion.id}
                          className="flex-1 md:w-28 px-4 py-2 bg-black text-white border-2 border-black font-bold uppercase text-[10px] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                          {processingId === suggestion.id ? (
                            <i className="fa-solid fa-spinner fa-spin" />
                          ) : (
                            <i className="fa-solid fa-check" />
                          )}
                          Duyệt
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDialog({
                              isOpen: true,
                              title: "Từ chối đề xuất?",
                              message:
                                "Bác bỏ đề xuất và giữ nguyên bản dịch hiện tại.",
                              action: "rejected",
                              suggestionId: suggestion.id,
                            })
                          }
                          disabled={processingId === suggestion.id}
                          className="flex-1 md:w-28 px-4 py-2 bg-white border-2 border-black font-bold uppercase text-[10px] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                          <i className="fa-solid fa-times" />
                          Bác bỏ
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {suggestions.length > perPage && (
            <div className="flex justify-center gap-2 pt-8">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={currentPage === 1}
                className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
              >
                <i className="fa-solid fa-chevron-left text-xs" />
              </button>

              <div className="flex gap-1.5">
                {Array.from({
                  length: Math.ceil(suggestions.length / perPage),
                }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`w-10 h-10 border-2 border-black font-bold text-xs flex items-center justify-center transition-all ${
                        currentPage === pageNum
                          ? "bg-black text-white shadow-none"
                          : "bg-white text-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setCurrentPage((p) =>
                    Math.min(Math.ceil(suggestions.length / perPage), p + 1)
                  );
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={
                  currentPage === Math.ceil(suggestions.length / perPage)
                }
                className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
              >
                <i className="fa-solid fa-chevron-right text-xs" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={
            confirmDialog.action === "approved" ? "Duyệt ngay" : "Từ chối"
          }
          type={confirmDialog.action === "approved" ? "info" : "danger"}
          cancelText="Hủy"
          onConfirm={() =>
            handleReview(confirmDialog.suggestionId, confirmDialog.action)
          }
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
};

export default AdminSuggestions;
