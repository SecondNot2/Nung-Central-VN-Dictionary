import React, { useState, useEffect } from "react";
import {
  ToastContainer,
  useToast,
  ConfirmDialog,
  EditContributionModal,
} from "../components";
import {
  getContributions,
  getContributionCounts,
  updateContribution,
  approveContribution,
  rejectContribution,
  deleteContribution,
} from "../services/contributionService";
import { Contribution, AppRoute } from "../types";

// Language Options
const languageOptions = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "nung", label: "Tiếng Nùng (Lạng Sơn)" },
  { value: "central", label: "Tiếng Nghệ An / Hà Tĩnh" },
];

type StatusFilter = "all" | "pending" | "approved" | "rejected";

interface AdminContributionsProps {
  setRoute: (route: AppRoute) => void;
}

const AdminContributions: React.FC<AdminContributionsProps> = ({
  setRoute,
}) => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0,
  });

  // Modals & Dialogs
  const [editingContribution, setEditingContribution] =
    useState<Contribution | null>(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionTargetId, setActionTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  // Load contribution counts on mount
  const loadCounts = async () => {
    const countsData = await getContributionCounts();
    setCounts(countsData);
  };

  // Load contributions
  const loadContributions = async () => {
    setLoading(true);
    const filter = statusFilter === "all" ? undefined : statusFilter;
    const result = await getContributions(filter);
    if (result.success) {
      setContributions(result.data);
    }
    setLoading(false);
  };

  // Load counts on mount
  useEffect(() => {
    loadCounts();
  }, []);

  useEffect(() => {
    loadContributions();
  }, [statusFilter]);

  // Get language label
  const getLangLabel = (code: string) =>
    languageOptions.find((l) => l.value === code)?.label || code;

  // Handle edit save
  const handleEditSave = async (id: string, updates: Partial<Contribution>) => {
    const result = await updateContribution(id, updates);
    if (result.success) {
      setContributions(
        contributions.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
      addToast("Đã cập nhật đóng góp", "success");
    } else {
      addToast(result.error || "Không thể cập nhật", "error");
    }
    setEditingContribution(null);
  };

  // Approve handlers
  const handleApproveClick = (id: string) => {
    setActionTargetId(id);
    setShowApproveConfirm(true);
  };

  const handleConfirmedApprove = async () => {
    if (!actionTargetId) return;
    setProcessing(true);

    const result = await approveContribution(actionTargetId);
    if (result.success) {
      setContributions(
        contributions.map((c) =>
          c.id === actionTargetId ? { ...c, status: "approved" as const } : c
        )
      );
      addToast("Đã duyệt đóng góp", "success");
    } else {
      addToast(result.error || "Không thể duyệt", "error");
    }

    setProcessing(false);
    setShowApproveConfirm(false);
    setActionTargetId(null);
  };

  // Reject handlers
  const handleRejectClick = (id: string) => {
    setActionTargetId(id);
    setRejectReason("");
    setShowRejectConfirm(true);
  };

  const handleConfirmedReject = async () => {
    if (!actionTargetId) return;
    setProcessing(true);

    const result = await rejectContribution(actionTargetId, rejectReason);
    if (result.success) {
      setContributions(
        contributions.map((c) =>
          c.id === actionTargetId
            ? { ...c, status: "rejected" as const, reject_reason: rejectReason }
            : c
        )
      );
      addToast("Đã từ chối đóng góp", "info");
    } else {
      addToast(result.error || "Không thể từ chối", "error");
    }

    setProcessing(false);
    setShowRejectConfirm(false);
    setActionTargetId(null);
    setRejectReason("");
  };

  // Delete handlers
  const handleDeleteClick = (id: string) => {
    setActionTargetId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmedDelete = async () => {
    if (!actionTargetId) return;
    setProcessing(true);

    const result = await deleteContribution(actionTargetId);
    if (result.success) {
      setContributions(contributions.filter((c) => c.id !== actionTargetId));
      addToast("Đã xóa đóng góp", "info");
    } else {
      addToast(result.error || "Không thể xóa", "error");
    }

    setProcessing(false);
    setShowDeleteConfirm(false);
    setActionTargetId(null);
  };

  // Refresh counts after actions
  const refreshCounts = () => {
    loadCounts();
  };

  const filterTabs: { key: StatusFilter; label: string; icon: string }[] = [
    { key: "pending", label: "Chờ duyệt", icon: "fa-clock" },
    { key: "approved", label: "Đã duyệt", icon: "fa-check" },
    { key: "rejected", label: "Từ chối", icon: "fa-xmark" },
    { key: "all", label: "Tất cả", icon: "fa-list" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Edit Modal */}
      <EditContributionModal
        isOpen={!!editingContribution}
        contribution={editingContribution}
        onSave={handleEditSave}
        onCancel={() => setEditingContribution(null)}
      />

      {/* Approve Confirmation */}
      <ConfirmDialog
        isOpen={showApproveConfirm}
        title="Duyệt đóng góp?"
        message="Đánh dấu đóng góp này là đã được duyệt. Từ này sẽ được thêm vào từ điển."
        confirmText="Duyệt"
        cancelText="Hủy"
        type="info"
        onConfirm={handleConfirmedApprove}
        onCancel={() => {
          setShowApproveConfirm(false);
          setActionTargetId(null);
        }}
      />

      {/* Reject Confirmation with Reason Input */}
      {showRejectConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowRejectConfirm(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
              <div className="p-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 mb-4">
                  <i className="fa-solid fa-triangle-exclamation text-2xl text-amber-600"></i>
                </div>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-earth-900">
                    Từ chối đóng góp?
                  </h3>
                  <p className="text-earth-600 mt-1">
                    Vui lòng cho biết lý do từ chối
                  </p>
                </div>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối..."
                  className="w-full border border-earth-300 rounded-lg px-3 py-2 text-earth-900 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                  rows={3}
                />
              </div>
              <div className="bg-earth-50 px-6 py-4 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowRejectConfirm(false);
                    setActionTargetId(null);
                    setRejectReason("");
                  }}
                  className="px-5 py-2.5 rounded-xl font-medium text-earth-700 bg-white border border-earth-300 hover:bg-earth-100 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmedReject}
                  disabled={processing}
                  className="px-5 py-2.5 rounded-xl font-medium text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-md disabled:opacity-50"
                >
                  {processing ? (
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                  ) : (
                    "Từ chối"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Xóa đóng góp?"
        message="Đóng góp này sẽ bị xóa vĩnh viễn và không thể khôi phục."
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        onConfirm={handleConfirmedDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setActionTargetId(null);
        }}
      />

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-earth-100 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setRoute(AppRoute.ADMIN_DASHBOARD)}
            className="p-2 hover:bg-earth-100 rounded-lg transition-colors"
          >
            <i className="fa-solid fa-arrow-left text-earth-600"></i>
          </button>
          <div className="w-14 h-14 bg-earth-100 text-earth-600 rounded-full flex items-center justify-center text-2xl">
            <i className="fa-solid fa-user-shield"></i>
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-earth-900">
              Quản lý đóng góp
            </h1>
            <p className="text-earth-600">
              Duyệt, chỉnh sửa hoặc từ chối các đóng góp từ cộng đồng
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-md p-2 mb-6 flex gap-2 overflow-x-auto">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              statusFilter === tab.key
                ? "bg-bamboo-600 text-white shadow-md"
                : "text-earth-600 hover:bg-earth-100"
            }`}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            <span>{tab.label}</span>
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                statusFilter === tab.key
                  ? "bg-white/20"
                  : "bg-earth-200 text-earth-600"
              }`}
            >
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Contributions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center text-earth-500">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-3"></i>
            <p>Đang tải...</p>
          </div>
        ) : contributions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center text-earth-500">
            <i className="fa-solid fa-inbox text-4xl mb-3"></i>
            <p>Không có đóng góp nào</p>
          </div>
        ) : (
          contributions.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl shadow-md p-6 border border-earth-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="bg-earth-100 text-earth-600 px-3 py-1 rounded-lg text-sm">
                    {getLangLabel(c.source_lang)}
                  </span>
                  <i className="fa-solid fa-arrow-right text-earth-400"></i>
                  <span className="bg-bamboo-100 text-bamboo-700 px-3 py-1 rounded-lg text-sm">
                    {getLangLabel(c.target_lang)}
                  </span>
                  {c.region && (
                    <span className="text-earth-400 text-sm">• {c.region}</span>
                  )}
                </div>
                <span className="text-sm text-earth-400">
                  {new Date(c.created_at).toLocaleString("vi-VN")}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p className="text-xs text-earth-500 mb-1">Từ gốc</p>
                  <p className="text-xl font-semibold text-earth-900">
                    {c.word}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-earth-500 mb-1">Bản dịch</p>
                  <p className="text-xl font-semibold text-bamboo-700">
                    {c.translation}
                  </p>
                  {c.phonetic && (
                    <p className="text-sm text-earth-500 italic">
                      {c.phonetic}
                    </p>
                  )}
                </div>
              </div>

              {c.example && (
                <p className="text-earth-600 mb-2 italic bg-earth-50 px-4 py-2 rounded-lg">
                  <i className="fa-solid fa-quote-left text-earth-300 mr-2"></i>
                  {c.example}
                </p>
              )}

              {c.meaning && <p className="text-earth-600 mb-4">{c.meaning}</p>}

              {c.status === "rejected" && c.reject_reason && (
                <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg mb-4 text-sm">
                  <i className="fa-solid fa-circle-info mr-2"></i>
                  Lý do từ chối: {c.reject_reason}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-earth-100">
                {c.status === "pending" && (
                  <>
                    <button
                      onClick={() => setEditingContribution(c)}
                      className="flex-1 px-4 py-2 rounded-lg font-medium text-earth-700 bg-earth-100 hover:bg-earth-200 transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-pen"></i>
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleApproveClick(c.id)}
                      className="flex-1 px-4 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-check"></i>
                      Duyệt
                    </button>
                    <button
                      onClick={() => handleRejectClick(c.id)}
                      className="flex-1 px-4 py-2 rounded-lg font-medium text-white bg-amber-600 hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-xmark"></i>
                      Từ chối
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDeleteClick(c.id)}
                  className="px-4 py-2 rounded-lg font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-trash-can"></i>
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminContributions;
