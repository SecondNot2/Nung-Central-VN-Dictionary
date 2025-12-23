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
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-nung-red text-white border-2 border-black flex items-center gap-1 shadow-brutal-sm">
            <i className="fa-solid fa-bug" /> BÁO LỖI
          </span>
        );
      case "feature":
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-amber-400 text-black border-2 border-black flex items-center gap-1 shadow-brutal-sm">
            <i className="fa-solid fa-lightbulb" /> TÍNH NĂNG
          </span>
        );
      case "suggestion":
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-nung-blue text-white border-2 border-black flex items-center gap-1 shadow-brutal-sm">
            <i className="fa-solid fa-comment" /> GÓP Ý
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
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-white text-black border-2 border-black shadow-brutal-sm">
            MỚI
          </span>
        );
      case "in_progress":
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-amber-200 text-black border-2 border-black shadow-brutal-sm">
            ĐANG XỬ LÝ
          </span>
        );
      case "resolved":
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-green-400 text-black border-2 border-black shadow-brutal-sm">
            ĐÃ GIẢI QUYẾT
          </span>
        );
      case "closed":
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-gray-200 text-black border-2 border-black">
            ĐÃ ĐÓNG
          </span>
        );
      case "wont_fix":
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-gray-400 text-white border-2 border-black">
            KHÔNG XỬ LÝ
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
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-red-600 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pulse">
            KHẨN CẤP
          </span>
        );
      case "high":
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-orange-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            CAO
          </span>
        );
      case "medium":
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-blue-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            TRUNG BÌNH
          </span>
        );
      case "low":
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-gray-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            THẤP
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
    <div className="bg-white text-black min-h-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white border-2 border-black p-6 shadow-brutal-sm">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">
              Phản hồi người dùng
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-1">
              Lắng nghe và giải quyết các vấn đề từ cộng đồng
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-nung-orange text-white border-2 border-black px-4 py-2 font-bold uppercase tracking-widest text-[10px] shadow-brutal-sm">
              {counts.all} PHẢN HỒI
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Type Filter */}
          <div className="bg-white border-2 border-black p-6 shadow-brutal-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-filter" /> Phân loại
            </p>
            <div className="space-y-2">
              {[
                {
                  id: "all" as FilterType,
                  label: "Tất cả",
                  count: counts.all,
                  icon: "fa-list",
                },
                {
                  id: "bug" as FilterType,
                  label: "Báo lỗi",
                  count: counts.bug,
                  icon: "fa-bug",
                },
                {
                  id: "feature" as FilterType,
                  label: "Tính năng",
                  count: counts.feature,
                  icon: "fa-lightbulb",
                },
                {
                  id: "suggestion" as FilterType,
                  label: "Góp ý",
                  count: counts.suggestion,
                  icon: "fa-comment",
                },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setTypeFilter(f.id);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-4 py-3 border-2 border-black font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-between shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none ${
                    typeFilter === f.id
                      ? "bg-black text-white shadow-none"
                      : "bg-white text-black"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <i className={`fa-solid ${f.icon} text-xs`} />
                    {f.label}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 border-2 border-black text-[8px] ${
                      typeFilter === f.id
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

          {/* Status Filter */}
          <div className="bg-white border-2 border-black p-6 shadow-brutal-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-spinner" /> Trạng thái
            </p>
            <div className="space-y-2">
              {[
                {
                  id: "all" as StatusFilter,
                  label: "Toàn bộ",
                  icon: "fa-layer-group",
                },
                {
                  id: "new" as StatusFilter,
                  label: "Mới",
                  icon: "fa-plus-circle",
                },
                {
                  id: "in_progress" as StatusFilter,
                  label: "Đang xử lý",
                  icon: "fa-wrench",
                },
                {
                  id: "resolved" as StatusFilter,
                  label: "Đã xong",
                  icon: "fa-check-double",
                },
                {
                  id: "closed" as StatusFilter,
                  label: "Đã đóng",
                  icon: "fa-box-archive",
                },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setStatusFilter(s.id);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-4 py-3 border-2 border-black font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none ${
                    statusFilter === s.id
                      ? "bg-black text-white shadow-none"
                      : "bg-white text-black"
                  }`}
                >
                  <i className={`fa-solid ${s.icon} text-xs`} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white border-2 border-black p-8 shadow-brutal-sm"
                >
                  <div className="h-6 w-1/3 bg-gray-100 mb-4" />
                  <div className="h-12 w-full bg-gray-100" />
                </div>
              ))}
            </div>
          ) : paginatedFeedback.length === 0 ? (
            <div className="bg-white border-2 border-black p-16 text-center shadow-brutal-sm">
              <p className="text-xl font-bold uppercase tracking-tight text-gray-400">
                Hộp thư trống
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedFeedback.map((feedback) => (
                <div
                  key={feedback.id}
                  className="bg-white border-2 border-black p-6 shadow-brutal-sm transition-all group"
                >
                  <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        {getTypeBadge(feedback.type)}
                        {getStatusBadge(feedback.status)}
                        {feedback.type === "bug" &&
                          getPriorityBadge(feedback.priority)}
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          {formatDate(feedback.created_at)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="mb-6">
                        <h3 className="text-xl font-bold uppercase tracking-tight mb-2">
                          {feedback.title}
                        </h3>
                        <p className="text-black font-medium text-lg leading-relaxed">
                          {feedback.description}
                        </p>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border-2 border-black p-3 shadow-brutal-sm">
                          <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                            Người gửi:
                          </span>
                          <span className="text-xs font-bold uppercase">
                            {feedback.user_name || "Khách vãng lai"}
                          </span>
                        </div>

                        {feedback.category && (
                          <div className="bg-gray-50 border-2 border-black p-3 shadow-brutal-sm">
                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                              Danh mục:
                            </span>
                            <span className="text-xs font-bold uppercase">
                              {feedback.category}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Admin Response */}
                      {feedback.admin_response && (
                        <div className="mt-4 p-4 bg-blue-50 border-2 border-black">
                          <span className="text-[8px] font-black uppercase tracking-widest text-nung-blue block mb-1">
                            PHẢN HỒI HỆ THỐNG:
                          </span>
                          <p className="text-blue-900 font-medium italic text-sm">
                            {feedback.admin_response}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto self-start">
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
                        className="flex-1 md:w-28 px-4 py-2 bg-black text-white border-2 border-black font-bold uppercase text-[10px] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5"
                      >
                        <i className="fa-solid fa-reply mr-2" />
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
                        className="flex-1 md:w-28 px-4 py-2 bg-white text-nung-red border-2 border-black font-bold uppercase text-[10px] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5"
                      >
                        <i className="fa-solid fa-trash mr-2" />
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
            <div className="flex justify-center gap-2 pt-8">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={currentPage === 1}
                className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50"
              >
                <i className="fa-solid fa-chevron-left text-xs" />
              </button>

              <div className="flex gap-1.5">
                {Array.from({
                  length: Math.ceil(feedbackList.length / perPage),
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
                          : "bg-white text-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5"
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
                    Math.min(Math.ceil(feedbackList.length / perPage), p + 1)
                  );
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={
                  currentPage === Math.ceil(feedbackList.length / perPage)
                }
                className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50"
              >
                <i className="fa-solid fa-chevron-right text-xs" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {responseModal.isOpen && responseModal.feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() =>
              setResponseModal({
                isOpen: false,
                feedback: null,
                response: "",
                newStatus: "",
              })
            }
          />
          <div className="relative bg-white border-2 border-black shadow-brutal-sm w-full max-w-xl animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold uppercase tracking-tight">
                  Xử lý phản hồi
                </h3>
                <button
                  onClick={() =>
                    setResponseModal({
                      isOpen: false,
                      feedback: null,
                      response: "",
                      newStatus: "",
                    })
                  }
                  className="text-gray-400 hover:text-black transition-colors"
                >
                  <i className="fa-solid fa-times text-lg" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-gray-50 border-2 border-black">
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                    Nội dung đang xử lý:
                  </span>
                  <p className="text-sm font-bold italic truncate">
                    "{responseModal.feedback.title}"
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                    Trạng thái mới
                  </label>
                  <select
                    value={responseModal.newStatus}
                    onChange={(e) =>
                      setResponseModal({
                        ...responseModal,
                        newStatus: e.target.value,
                      })
                    }
                    className="w-full border-2 border-black p-3 text-sm font-bold bg-white focus:bg-gray-50 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="new">Mới</option>
                    <option value="in_progress">Đang triển khai</option>
                    <option value="resolved">Hoàn tất</option>
                    <option value="closed">Đóng</option>
                    <option value="wont_fix">Không xử lý</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                    Nội dung trả lời
                  </label>
                  <textarea
                    value={responseModal.response}
                    onChange={(e) =>
                      setResponseModal({
                        ...responseModal,
                        response: e.target.value,
                      })
                    }
                    placeholder="Nhập nội dung phản hồi..."
                    className="w-full border-2 border-black p-3 text-sm font-medium focus:bg-gray-50 outline-none resize-none transition-all h-32"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-t-2 border-black p-4 flex gap-3">
              <button
                onClick={() =>
                  setResponseModal({
                    isOpen: false,
                    feedback: null,
                    response: "",
                    newStatus: "",
                  })
                }
                className="flex-1 px-4 py-2 bg-white border-2 border-black font-bold uppercase text-[10px] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={processingId === responseModal.feedback.id}
                className="flex-1 px-4 py-2 bg-black text-white border-2 border-black font-bold uppercase text-[10px] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5"
              >
                {processingId === responseModal.feedback.id ? (
                  <i className="fa-solid fa-spinner fa-spin" />
                ) : (
                  "Lưu thay đổi"
                )}
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
          message="Hành động này không thể hoàn tác."
          confirmText="Xóa vĩnh viễn"
          cancelText="Hủy"
          onConfirm={() => handleDelete(deleteConfirm.feedbackId)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default AdminFeedback;
