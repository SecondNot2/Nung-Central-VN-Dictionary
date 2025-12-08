import React, { useState, useEffect } from "react";
import { User, AppRoute } from "../../types";
import {
  ToastContainer,
  useToast,
  ConfirmDialog,
  Pagination,
} from "../../components";
import {
  getAllFeedback,
  updateFeedbackStatus,
  deleteFeedback,
  Feedback,
} from "../../services/api/feedbackService";

interface AdminFeedbackProps {
  user: User | null;
  setRoute: (route: AppRoute) => void;
}

type FilterType = "all" | "bug" | "feature" | "suggestion";
type StatusFilter =
  | "all"
  | "new"
  | "in_progress"
  | "resolved"
  | "closed"
  | "wont_fix";

const AdminFeedback: React.FC<AdminFeedbackProps> = ({ user, setRoute }) => {
  const { toasts, addToast, removeToast } = useToast();
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("new");
  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [responseModal, setResponseModal] = useState<{
    isOpen: boolean;
    feedback: Feedback | null;
    response: string;
    newStatus: string;
  }>({ isOpen: false, feedback: null, response: "", newStatus: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    feedbackId: string;
  } | null>(null);

  const perPage = 10;

  // Check admin access
  useEffect(() => {
    if (!user || user.role !== "admin") {
      addToast("Bạn không có quyền truy cập trang này", "error");
      setRoute(AppRoute.DICTIONARY);
    }
  }, [user, setRoute]);

  // Fetch feedback
  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchFeedback = async () => {
      setLoading(true);
      const data = await getAllFeedback(
        typeFilter === "all" ? undefined : typeFilter,
        statusFilter === "all" ? undefined : statusFilter
      );
      setFeedbackList(data);
      setLoading(false);
    };

    fetchFeedback();
  }, [user, typeFilter, statusFilter]);

  const handleUpdateStatus = async () => {
    if (!responseModal.feedback || !user) return;

    setProcessingId(responseModal.feedback.id);
    const success = await updateFeedbackStatus(
      responseModal.feedback.id,
      responseModal.newStatus as any,
      responseModal.response || null,
      user.id
    );

    if (success) {
      setFeedbackList((prev) =>
        prev.map((f) =>
          f.id === responseModal.feedback!.id
            ? {
                ...f,
                status: responseModal.newStatus as any,
                admin_response: responseModal.response || null,
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
              }
            : f
        )
      );
      addToast("Đã cập nhật trạng thái", "success");
    } else {
      addToast("Không thể cập nhật. Vui lòng thử lại.", "error");
    }

    setProcessingId(null);
    setResponseModal({
      isOpen: false,
      feedback: null,
      response: "",
      newStatus: "",
    });
  };

  const handleDelete = async (feedbackId: string) => {
    setProcessingId(feedbackId);
    const success = await deleteFeedback(feedbackId);

    if (success) {
      setFeedbackList((prev) => prev.filter((f) => f.id !== feedbackId));
      addToast("Đã xóa phản hồi", "success");
    } else {
      addToast("Không thể xóa. Vui lòng thử lại.", "error");
    }

    setProcessingId(null);
    setDeleteConfirm(null);
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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "bug":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full flex items-center gap-1">
            <i className="fa-solid fa-bug" /> Lỗi
          </span>
        );
      case "feature":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
            <i className="fa-solid fa-lightbulb" /> Tính năng
          </span>
        );
      case "suggestion":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
            <i className="fa-solid fa-comment" /> Góp ý
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            Mới
          </span>
        );
      case "in_progress":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
            Đang xử lý
          </span>
        );
      case "resolved":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            Đã giải quyết
          </span>
        );
      case "closed":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
            Đã đóng
          </span>
        );
      case "wont_fix":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
            Không xử lý
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded">
            Nghiêm trọng
          </span>
        );
      case "high":
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-orange-500 text-white rounded">
            Cao
          </span>
        );
      case "medium":
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded">
            TB
          </span>
        );
      case "low":
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-gray-400 text-white rounded">
            Thấp
          </span>
        );
      default:
        return null;
    }
  };

  // Pagination
  const paginatedFeedback = feedbackList.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const counts = {
    all: feedbackList.length,
    bug: feedbackList.filter((f) => f.type === "bug").length,
    feature: feedbackList.filter((f) => f.type === "feature").length,
    suggestion: feedbackList.filter((f) => f.type === "suggestion").length,
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 via-white to-bamboo-50 py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setRoute(AppRoute.ADMIN_DASHBOARD)}
            className="text-earth-500 hover:text-earth-700 mb-2 flex items-center gap-1 text-sm"
          >
            <i className="fa-solid fa-arrow-left" />
            Quay lại Dashboard
          </button>
          <h1 className="text-3xl font-bold text-earth-900">
            <i className="fa-solid fa-comment-dots mr-3 text-bamboo-600" />
            Quản lý phản hồi người dùng
          </h1>
          <p className="text-earth-600 mt-1">
            Xem và xử lý các báo lỗi, yêu cầu tính năng và góp ý từ người dùng
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 space-y-4">
          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-earth-500 self-center mr-2">
              Loại:
            </span>
            {[
              { id: "all" as FilterType, label: "Tất cả", count: counts.all },
              { id: "bug" as FilterType, label: "Báo lỗi", count: counts.bug },
              {
                id: "feature" as FilterType,
                label: "Tính năng",
                count: counts.feature,
              },
              {
                id: "suggestion" as FilterType,
                label: "Góp ý",
                count: counts.suggestion,
              },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setTypeFilter(f.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                  typeFilter === f.id
                    ? "bg-bamboo-600 text-white"
                    : "bg-earth-100 text-earth-600 hover:bg-earth-200"
                }`}
              >
                {f.label}
                {f.count > 0 && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                      typeFilter === f.id ? "bg-white/20" : "bg-earth-200"
                    }`}
                  >
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-earth-500 self-center mr-2">
              Trạng thái:
            </span>
            {[
              { id: "all" as StatusFilter, label: "Tất cả" },
              { id: "new" as StatusFilter, label: "Mới" },
              { id: "in_progress" as StatusFilter, label: "Đang xử lý" },
              { id: "resolved" as StatusFilter, label: "Đã giải quyết" },
              { id: "closed" as StatusFilter, label: "Đã đóng" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setStatusFilter(s.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                  statusFilter === s.id
                    ? "bg-earth-700 text-white"
                    : "bg-earth-100 text-earth-600 hover:bg-earth-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-earth-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : paginatedFeedback.length === 0 ? (
            <div className="p-12 text-center text-earth-400">
              <i className="fa-solid fa-inbox text-5xl mb-4 block opacity-50" />
              <p className="text-lg">Không có phản hồi nào</p>
            </div>
          ) : (
            <div className="divide-y divide-earth-100">
              {paginatedFeedback.map((feedback) => (
                <div
                  key={feedback.id}
                  className="p-6 hover:bg-earth-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {getTypeBadge(feedback.type)}
                        {getStatusBadge(feedback.status)}
                        {feedback.type === "bug" &&
                          getPriorityBadge(feedback.priority)}
                        <span className="text-earth-400 text-xs">
                          {formatDate(feedback.created_at)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-earth-900 mb-1">
                        {feedback.title}
                      </h3>

                      {/* Description */}
                      <p className="text-earth-600 text-sm mb-3 whitespace-pre-wrap">
                        {feedback.description}
                      </p>

                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-earth-400">
                        <span>
                          <i className="fa-solid fa-user mr-1" />
                          {feedback.user_name || "Ẩn danh"}
                        </span>
                        {feedback.category && (
                          <span>
                            <i className="fa-solid fa-tag mr-1" />
                            {feedback.category}
                          </span>
                        )}
                      </div>

                      {/* Admin Response */}
                      {feedback.admin_response && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                          <span className="text-xs font-medium text-green-600">
                            Phản hồi từ Admin:
                          </span>
                          <p className="text-green-800 text-sm mt-1">
                            {feedback.admin_response}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() =>
                          setResponseModal({
                            isOpen: true,
                            feedback,
                            response: feedback.admin_response || "",
                            newStatus: feedback.status,
                          })
                        }
                        disabled={processingId === feedback.id}
                        className="px-3 py-1.5 bg-bamboo-500 text-white rounded-lg hover:bg-bamboo-600 disabled:opacity-50 text-sm font-medium flex items-center gap-1"
                      >
                        <i className="fa-solid fa-reply" />
                        Xử lý
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            isOpen: true,
                            feedbackId: feedback.id,
                          })
                        }
                        disabled={processingId === feedback.id}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm font-medium flex items-center gap-1"
                      >
                        <i className="fa-solid fa-trash" />
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {feedbackList.length > perPage && (
            <div className="p-4 border-t border-earth-100">
              <Pagination
                currentPage={currentPage}
                totalItems={feedbackList.length}
                itemsPerPage={perPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {responseModal.isOpen && responseModal.feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() =>
              setResponseModal({
                isOpen: false,
                feedback: null,
                response: "",
                newStatus: "",
              })
            }
          />
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-lg w-full">
            <h3 className="text-lg font-bold text-earth-900 mb-4">
              Xử lý phản hồi
            </h3>

            {/* Status */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-earth-700 mb-2">
                Trạng thái
              </label>
              <select
                value={responseModal.newStatus}
                onChange={(e) =>
                  setResponseModal({
                    ...responseModal,
                    newStatus: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-earth-200 rounded-lg outline-none focus:ring-2 focus:ring-bamboo-500"
              >
                <option value="new">Mới</option>
                <option value="in_progress">Đang xử lý</option>
                <option value="resolved">Đã giải quyết</option>
                <option value="closed">Đã đóng</option>
                <option value="wont_fix">Không xử lý</option>
              </select>
            </div>

            {/* Response */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-earth-700 mb-2">
                Phản hồi cho người dùng
              </label>
              <textarea
                value={responseModal.response}
                onChange={(e) =>
                  setResponseModal({
                    ...responseModal,
                    response: e.target.value,
                  })
                }
                placeholder="Nhập phản hồi cho người dùng..."
                rows={4}
                className="w-full px-3 py-2 border border-earth-200 rounded-lg outline-none focus:ring-2 focus:ring-bamboo-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() =>
                  setResponseModal({
                    isOpen: false,
                    feedback: null,
                    response: "",
                    newStatus: "",
                  })
                }
                className="px-4 py-2 text-sm text-earth-600 hover:bg-earth-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={processingId === responseModal.feedback.id}
                className="px-4 py-2 text-sm bg-bamboo-600 text-white rounded-lg hover:bg-bamboo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {processingId === responseModal.feedback.id && (
                  <i className="fa-solid fa-circle-notch fa-spin" />
                )}
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          title="Xóa phản hồi?"
          message="Bạn có chắc chắn muốn xóa phản hồi này? Hành động này không thể hoàn tác."
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={() => handleDelete(deleteConfirm.feedbackId)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default AdminFeedback;
