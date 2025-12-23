import React, { useState, useEffect } from "react";
import { User, AppRoute } from "../../types";
import {
  ToastContainer,
  useToast,
  ConfirmDialog,
  Pagination,
} from "../../components";
import {
  getAllReports,
  reviewReport,
  deleteReportedDiscussion,
  DiscussionReport,
} from "../../services/api/reportService";

interface AdminReportsProps {
  user: User | null;
  setRoute: (route: AppRoute) => void;
}

type FilterType = "all" | "pending" | "resolved" | "dismissed";

const AdminReports: React.FC<AdminReportsProps> = ({ user, setRoute }) => {
  const { toasts, addToast, removeToast } = useToast();
  const [reports, setReports] = useState<DiscussionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
    confirmText: string;
    isDanger?: boolean;
  } | null>(null);

  const perPage = 10;

  // Check admin access
  useEffect(() => {
    if (!user || user.role !== "admin") {
      addToast("Bạn không có quyền truy cập trang này", "error");
      setRoute(AppRoute.DICTIONARY);
    }
  }, [user, setRoute]);

  // Fetch reports
  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchReports = async () => {
      setLoading(true);
      const data = await getAllReports(
        filter === "all" ? undefined : (filter as any)
      );
      setReports(data);
      setLoading(false);
    };

    fetchReports();
  }, [user, filter]);

  const handleDismiss = async (reportId: string) => {
    if (!user) return;

    setProcessingId(reportId);
    const success = await reviewReport(
      reportId,
      user.id,
      "dismissed",
      "Bỏ qua báo cáo"
    );

    if (success) {
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? {
                ...r,
                status: "dismissed" as const,
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
              }
            : r
        )
      );
      addToast("Đã bỏ qua báo cáo", "success");
    } else {
      addToast("Không thể xử lý báo cáo", "error");
    }

    setProcessingId(null);
    setConfirmDialog(null);
  };

  const handleDeleteComment = async (
    reportId: string,
    discussionId: string
  ) => {
    if (!user) return;

    setProcessingId(reportId);

    // Delete the comment first
    const deleteSuccess = await deleteReportedDiscussion(discussionId);

    if (deleteSuccess) {
      // Mark report as resolved
      await reviewReport(reportId, user.id, "resolved", "Đã xóa bình luận");

      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? {
                ...r,
                status: "resolved" as const,
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
                action_taken: "Đã xóa bình luận",
                discussion_content: "[Đã bị xóa]",
              }
            : r
        )
      );
      addToast("Đã xóa bình luận vi phạm", "success");
    } else {
      addToast("Không thể xóa bình luận", "error");
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
            ĐANG CHỜ XỬ LÝ
          </span>
        );
      case "resolved":
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-green-400 text-black border-2 border-black shadow-brutal-sm">
            ĐÃ GIẢI QUYẾT
          </span>
        );
      case "dismissed":
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-gray-400 text-white border-2 border-black">
            ĐÃ BÁC BỎ
          </span>
        );
      default:
        return null;
    }
  };

  // Filter and paginate
  const filteredReports =
    filter === "all" ? reports : reports.filter((r) => r.status === filter);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const counts = {
    all: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    dismissed: reports.filter((r) => r.status === "dismissed").length,
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
              Báo cáo vi phạm
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-1">
              Kiểm duyệt bình luận và nội dung không phù hợp
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-nung-red text-white border-2 border-black px-4 py-2 font-bold uppercase tracking-widest text-[10px] shadow-brutal-sm">
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
              <i className="fa-solid fa-filter" /> Trạng thái xử lý
            </p>
            <div className="space-y-2">
              {[
                {
                  id: "pending" as FilterType,
                  label: "Chờ xử lý",
                  count: counts.pending,
                  icon: "fa-clock",
                },
                {
                  id: "resolved" as FilterType,
                  label: "Đã giải quyết",
                  count: counts.resolved,
                  icon: "fa-check-double",
                },
                {
                  id: "dismissed" as FilterType,
                  label: "Đã bác bỏ",
                  count: counts.dismissed,
                  icon: "fa-ban",
                },
                {
                  id: "all" as FilterType,
                  label: "Tất cả",
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

        {/* Reports List */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white border-2 border-black p-8 shadow-brutal-sm"
                >
                  <div className="h-4 w-1/3 bg-gray-100 mb-4" />
                  <div className="h-12 w-full bg-gray-100" />
                </div>
              ))}
            </div>
          ) : paginatedReports.length === 0 ? (
            <div className="bg-white border-2 border-black p-16 text-center shadow-brutal-sm">
              <p className="text-xl font-bold uppercase tracking-tight text-gray-400">
                Không có báo cáo nào
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white border-2 border-black p-6 shadow-brutal-sm transition-all group"
                >
                  <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        {getStatusBadge(report.status)}
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          {formatDate(report.created_at)}
                        </span>
                      </div>

                      {/* Content Card */}
                      <div className="mb-6 p-5 bg-gray-50 border-2 border-black">
                        <div className="flex items-center gap-2 mb-3">
                          <i className="fa-solid fa-comment text-nung-red text-xs" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-nung-red">
                            Bình luận bị báo cáo
                          </span>
                        </div>
                        <p className="text-black font-medium text-lg leading-relaxed">
                          "{report.discussion_content}"
                        </p>
                        <div className="mt-3 pt-3 border-t border-gray-200 text-[10px] font-bold text-gray-400">
                          Tác giả: {report.discussion_user_name}
                        </div>
                      </div>

                      {/* Reporter Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border-2 border-black p-3 shadow-brutal-sm">
                          <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                            Người báo cáo:
                          </span>
                          <span className="text-xs font-bold uppercase">
                            {report.reporter_name}
                          </span>
                        </div>

                        {report.reason && (
                          <div className="bg-amber-50 border-2 border-black p-3 shadow-brutal-sm">
                            <span className="text-[8px] font-black uppercase tracking-widest text-amber-600 block mb-1">
                              Lý do:
                            </span>
                            <p className="text-xs font-medium italic text-amber-900 leading-tight">
                              {report.reason}
                            </p>
                          </div>
                        )}
                      </div>

                      {report.action_taken && (
                        <div className="mt-4 p-4 bg-green-50 border-2 border-black">
                          <span className="text-[8px] font-black uppercase tracking-widest text-green-600 block mb-1">
                            KẾT LUẬN:
                          </span>
                          <p className="text-green-900 font-medium italic text-sm">
                            {report.action_taken}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {report.status === "pending" && (
                      <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto self-start">
                        <button
                          onClick={() =>
                            setConfirmDialog({
                              isOpen: true,
                              title: "Xóa bình luận?",
                              message:
                                "Hành động này sẽ xóa vĩnh viễn bình luận bị báo cáo.",
                              confirmText: "Xóa ngay",
                              isDanger: true,
                              action: async () =>
                                handleDeleteComment(
                                  report.id,
                                  report.discussion_id
                                ),
                            })
                          }
                          disabled={processingId === report.id}
                          className="flex-1 md:w-28 px-4 py-2 bg-black text-white border-2 border-black font-bold uppercase text-[10px] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                          {processingId === report.id ? (
                            <i className="fa-solid fa-spinner fa-spin" />
                          ) : (
                            <i className="fa-solid fa-trash" />
                          )}
                          Xóa
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDialog({
                              isOpen: true,
                              title: "Bác bỏ báo cáo?",
                              message:
                                "Giữ lại bình luận và đánh dấu báo cáo là không hợp lệ.",
                              confirmText: "Bác bỏ",
                              action: async () => handleDismiss(report.id),
                            })
                          }
                          disabled={processingId === report.id}
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
          {filteredReports.length > perPage && (
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
                  length: Math.ceil(filteredReports.length / perPage),
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
                    Math.min(Math.ceil(filteredReports.length / perPage), p + 1)
                  );
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={
                  currentPage === Math.ceil(filteredReports.length / perPage)
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
          confirmText={confirmDialog.confirmText}
          cancelText="Hủy"
          type={confirmDialog.isDanger ? "danger" : "info"}
          onConfirm={confirmDialog.action}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
};

export default AdminReports;
