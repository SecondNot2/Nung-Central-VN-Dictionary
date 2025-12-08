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
          <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
            Đang chờ
          </span>
        );
      case "resolved":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            Đã xử lý
          </span>
        );
      case "dismissed":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
            Đã bỏ qua
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
            <i className="fa-solid fa-flag mr-3 text-red-500" />
            Quản lý báo cáo bình luận
          </h1>
          <p className="text-earth-600 mt-1">
            Xem xét và xử lý các bình luận bị báo cáo vi phạm
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              {
                id: "pending" as FilterType,
                label: "Đang chờ",
                count: counts.pending,
                color: "amber",
              },
              {
                id: "resolved" as FilterType,
                label: "Đã xử lý",
                count: counts.resolved,
                color: "green",
              },
              {
                id: "dismissed" as FilterType,
                label: "Đã bỏ qua",
                count: counts.dismissed,
                color: "gray",
              },
              {
                id: "all" as FilterType,
                label: "Tất cả",
                count: counts.all,
                color: "earth",
              },
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

        {/* Reports List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-earth-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : paginatedReports.length === 0 ? (
            <div className="p-12 text-center text-earth-400">
              <i className="fa-solid fa-inbox text-5xl mb-4 block opacity-50" />
              <p className="text-lg">Không có báo cáo nào</p>
            </div>
          ) : (
            <div className="divide-y divide-earth-100">
              {paginatedReports.map((report) => (
                <div
                  key={report.id}
                  className="p-6 hover:bg-earth-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Status & Date */}
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusBadge(report.status)}
                        <span className="text-earth-400 text-sm">
                          {formatDate(report.created_at)}
                        </span>
                      </div>

                      {/* Reported Comment */}
                      <div className="mb-3 p-4 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="fa-solid fa-comment text-red-400" />
                          <span className="text-xs font-medium text-red-600 uppercase">
                            Bình luận bị báo cáo
                          </span>
                          <span className="text-xs text-red-500">
                            bởi {report.discussion_user_name}
                          </span>
                        </div>
                        <p className="text-earth-800 italic">
                          "{report.discussion_content}"
                        </p>
                      </div>

                      {/* Reporter Info */}
                      <div className="flex items-center gap-2 text-sm text-earth-600">
                        <i className="fa-solid fa-user text-earth-400" />
                        <span>
                          Người báo cáo: <strong>{report.reporter_name}</strong>
                        </span>
                      </div>

                      {/* Report Reason */}
                      {report.reason && (
                        <div className="mt-2 p-3 bg-amber-50 rounded-lg">
                          <span className="text-xs font-medium text-amber-600">
                            Lý do báo cáo:
                          </span>
                          <p className="text-amber-800 text-sm mt-1">
                            {report.reason}
                          </p>
                        </div>
                      )}

                      {/* Action taken (if resolved) */}
                      {report.action_taken && (
                        <div className="mt-2 p-3 bg-green-50 rounded-lg">
                          <span className="text-xs font-medium text-green-600">
                            Hành động đã thực hiện:
                          </span>
                          <p className="text-green-800 text-sm mt-1">
                            {report.action_taken}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {report.status === "pending" && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() =>
                            setConfirmDialog({
                              isOpen: true,
                              title: "Xóa bình luận vi phạm?",
                              message:
                                "Bình luận sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.",
                              confirmText: "Xóa bình luận",
                              isDanger: true,
                              action: async () =>
                                handleDeleteComment(
                                  report.id,
                                  report.discussion_id
                                ),
                            })
                          }
                          disabled={processingId === report.id}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                        >
                          {processingId === report.id ? (
                            <i className="fa-solid fa-circle-notch fa-spin" />
                          ) : (
                            <i className="fa-solid fa-trash" />
                          )}
                          Xóa bình luận
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDialog({
                              isOpen: true,
                              title: "Bỏ qua báo cáo?",
                              message:
                                "Bình luận sẽ được giữ nguyên và báo cáo sẽ bị bỏ qua.",
                              confirmText: "Bỏ qua",
                              action: async () => handleDismiss(report.id),
                            })
                          }
                          disabled={processingId === report.id}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                        >
                          <i className="fa-solid fa-times" />
                          Bỏ qua
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
            <div className="p-4 border-t border-earth-100">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredReports.length}
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
          confirmText={confirmDialog.confirmText}
          cancelText="Hủy"
          onConfirm={confirmDialog.action}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
};

export default AdminReports;
