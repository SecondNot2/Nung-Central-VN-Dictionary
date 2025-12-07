import React, { useState, useEffect } from "react";
import { User, AppRoute } from "../types";
import {
  ToastContainer,
  useToast,
  ConfirmDialog,
  Pagination,
} from "../components";
import {
  getPendingSuggestions,
  reviewSuggestion,
  TranslationSuggestion,
} from "../services/suggestionService";
import { supabase, isSupabaseConfigured } from "../services/supabaseClient";

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
    <div className="min-h-screen bg-gradient-to-br from-earth-50 via-white to-bamboo-50 py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => setRoute(AppRoute.ADMIN_DASHBOARD)}
              className="text-earth-500 hover:text-earth-700 mb-2 flex items-center gap-1 text-sm"
            >
              <i className="fa-solid fa-arrow-left" />
              Quay lại Dashboard
            </button>
            <h1 className="text-3xl font-bold text-earth-900">
              <i className="fa-solid fa-pen-to-square mr-3 text-bamboo-600" />
              Quản lý đề xuất chỉnh sửa
            </h1>
            <p className="text-earth-600 mt-1">
              Xem xét và phê duyệt các đề xuất chỉnh sửa bản dịch từ người dùng
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              {
                id: "pending" as FilterType,
                label: "Đang chờ",
                count: counts.pending,
              },
              {
                id: "approved" as FilterType,
                label: "Đã duyệt",
                count: counts.approved,
              },
              {
                id: "rejected" as FilterType,
                label: "Từ chối",
                count: counts.rejected,
              },
              { id: "all" as FilterType, label: "Tất cả", count: counts.all },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setFilter(f.id);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === f.id
                    ? "bg-bamboo-600 text-white"
                    : "bg-earth-100 text-earth-600 hover:bg-earth-200"
                }`}
              >
                {f.label}
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    filter === f.id ? "bg-white/20" : "bg-earth-200"
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Suggestions List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-earth-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : paginatedSuggestions.length === 0 ? (
            <div className="p-12 text-center text-earth-400">
              <i className="fa-solid fa-inbox text-5xl mb-4 block opacity-50" />
              <p className="text-lg">Không có đề xuất nào</p>
            </div>
          ) : (
            <div className="divide-y divide-earth-100">
              {paginatedSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-6 hover:bg-earth-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Status & Date */}
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusBadge(suggestion.status)}
                        <span className="text-earth-400 text-sm">
                          {formatDate(suggestion.created_at)}
                        </span>
                      </div>

                      {/* Original Text */}
                      <div className="mb-3">
                        <span className="text-xs font-medium text-earth-500 uppercase">
                          Văn bản gốc
                        </span>
                        <p className="text-earth-800 mt-1">
                          {suggestion.original_text}
                        </p>
                      </div>

                      {/* Translation Comparison */}
                      <div className="flex items-center gap-3 p-3 bg-earth-50 rounded-lg">
                        <div className="flex-1">
                          <span className="text-xs text-earth-400">
                            Bản dịch hiện tại
                          </span>
                          <p className="text-earth-600 line-through">
                            {suggestion.original_translation}
                          </p>
                        </div>
                        <i className="fa-solid fa-arrow-right text-earth-300" />
                        <div className="flex-1">
                          <span className="text-xs text-bamboo-600">
                            Đề xuất mới
                          </span>
                          <p className="text-bamboo-700 font-medium">
                            {suggestion.suggested_translation}
                          </p>
                        </div>
                      </div>

                      {/* Reason */}
                      {suggestion.reason && (
                        <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                          <span className="text-xs font-medium text-amber-600">
                            Lý do
                          </span>
                          <p className="text-amber-800 text-sm mt-1">
                            {suggestion.reason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {suggestion.status === "pending" && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() =>
                            setConfirmDialog({
                              isOpen: true,
                              title: "Phê duyệt đề xuất?",
                              message:
                                "Bạn có chắc chắn muốn phê duyệt đề xuất này?",
                              action: "approved",
                              suggestionId: suggestion.id,
                            })
                          }
                          disabled={processingId === suggestion.id}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                        >
                          {processingId === suggestion.id ? (
                            <i className="fa-solid fa-circle-notch fa-spin" />
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
                                "Bạn có chắc chắn muốn từ chối đề xuất này?",
                              action: "rejected",
                              suggestionId: suggestion.id,
                            })
                          }
                          disabled={processingId === suggestion.id}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                        >
                          <i className="fa-solid fa-times" />
                          Từ chối
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
            <div className="p-4 border-t border-earth-100">
              <Pagination
                currentPage={currentPage}
                totalItems={suggestions.length}
                itemsPerPage={perPage}
                onPageChange={setCurrentPage}
              />
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
            confirmDialog.action === "approved" ? "Duyệt" : "Từ chối"
          }
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
