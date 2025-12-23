import React, { useState, useEffect } from "react";
import {
  ToastContainer,
  useToast,
  ConfirmDialog,
  EditContributionModal,
} from "../../components";
import {
  getContributions,
  getContributionCounts,
  updateContribution,
  approveContribution,
  rejectContribution,
  deleteContribution,
} from "../../services/api/contributionService";
import { Contribution, AppRoute } from "../../types";

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

  const filterTabs: {
    key: StatusFilter;
    label: string;
    icon: string;
    color: string;
  }[] = [
    {
      key: "pending",
      label: "Chờ duyệt",
      icon: "fa-clock",
      color: "bg-amber-400",
    },
    {
      key: "approved",
      label: "Đã duyệt",
      icon: "fa-check",
      color: "bg-green-400",
    },
    {
      key: "rejected",
      label: "Từ chối",
      icon: "fa-xmark",
      color: "bg-nung-red",
    },
    { key: "all", label: "Tất cả", icon: "fa-list", color: "bg-blue-400" },
  ];

  return (
    <div className="bg-white text-black">
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
        message="Từ này sẽ được thêm vào từ điển chính thức."
        confirmText="Duyệt"
        cancelText="Hủy"
        type="info"
        onConfirm={handleConfirmedApprove}
        onCancel={() => {
          setShowApproveConfirm(false);
          setActionTargetId(null);
        }}
      />

      {/* Reject Confirmation */}
      {showRejectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowRejectConfirm(false)}
          />
          <div className="relative bg-white border-4 border-black shadow-brutal w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold uppercase tracking-tight mb-4">
                Lý do từ chối
              </h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do..."
                className="w-full border-2 border-black p-3 text-sm font-medium focus:bg-gray-50 outline-none resize-none transition-all placeholder:text-gray-300"
                rows={4}
              />
            </div>
            <div className="bg-gray-50 border-t-2 border-black p-4 flex gap-3">
              <button
                onClick={() => {
                  setShowRejectConfirm(false);
                  setActionTargetId(null);
                  setRejectReason("");
                }}
                className="flex-1 px-4 py-2 bg-white border-2 border-black font-bold uppercase text-[10px] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmedReject}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-nung-red text-white border-2 border-black font-bold uppercase text-[10px] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Xóa đóng góp?"
        message="Hành động này không thể hoàn tác."
        confirmText="Xóa vĩnh viễn"
        cancelText="Hủy"
        type="danger"
        onConfirm={handleConfirmedDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setActionTargetId(null);
        }}
      />

      {/* Header Container */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white border-2 border-black p-6 shadow-brutal-sm">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">
              Quản lý đóng góp
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-1">
              Phê duyệt nội dung từ cộng đồng Nùng Lexicon
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-black text-white border-2 border-black px-4 py-2 font-bold uppercase tracking-widest text-[10px] shadow-brutal-sm">
              {counts.pending} CHỜ DUYỆT
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-3 border-2 border-black font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-between shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none ${
                statusFilter === tab.key
                  ? `${tab.color} text-black shadow-none`
                  : "bg-white text-black"
              }`}
            >
              <div className="flex items-center gap-2">
                <i className={`fa-solid ${tab.icon} text-xs`}></i>
                <span>{tab.label}</span>
              </div>
              <span className="bg-black text-white px-1.5 py-0.5 border border-black text-[8px]">
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Contributions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border-2 border-black shadow-brutal-sm p-24 text-center">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-nung-blue mb-4"></i>
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
              Đang tải...
            </p>
          </div>
        ) : contributions.length === 0 ? (
          <div className="bg-white border-2 border-black shadow-brutal-sm p-16 text-center">
            <p className="text-xl font-bold uppercase tracking-tight text-gray-400">
              Không có dữ liệu
            </p>
          </div>
        ) : (
          contributions.map((c) => (
            <div
              key={c.id}
              className="bg-white border-2 border-black p-6 shadow-brutal-sm relative overflow-hidden group"
            >
              {/* Status Badge */}
              <div
                className={`absolute top-0 right-0 px-3 py-1 border-l-2 border-b-2 border-black font-bold uppercase tracking-widest text-[8px] ${
                  c.status === "approved"
                    ? "bg-green-400"
                    : c.status === "rejected"
                    ? "bg-nung-red text-white"
                    : "bg-amber-400"
                }`}
              >
                {c.status === "approved"
                  ? "Đã duyệt"
                  : c.status === "rejected"
                  ? "Từ chối"
                  : "Chờ duyệt"}
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-6 pt-2">
                <span className="px-2 py-0.5 bg-gray-100 border-2 border-black font-bold uppercase text-[8px]">
                  {getLangLabel(c.source_lang)}
                </span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
                <span className="px-2 py-0.5 bg-nung-blue text-white border-2 border-black font-bold uppercase text-[8px]">
                  {getLangLabel(c.target_lang)}
                </span>
                {c.region && (
                  <span className="px-2 py-0.5 bg-gray-50 border-2 border-black font-bold uppercase text-[8px] text-gray-500">
                    {c.region}
                  </span>
                )}
                <span className="text-[10px] font-bold text-gray-400 ml-auto uppercase tracking-tighter">
                  {new Date(c.created_at).toLocaleDateString("vi-VN")}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    Gốc:
                  </p>
                  <p className="text-2xl font-bold text-black">{c.word}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    Dịch:
                  </p>
                  <p className="text-2xl font-bold text-nung-blue">
                    {c.translation}
                  </p>
                  {c.phonetic && (
                    <p className="text-sm font-medium italic text-gray-500 mt-1">
                      [{c.phonetic}]
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {c.example && (
                  <div className="bg-gray-50 border-2 border-black p-4">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-2">
                      Ví dụ:
                    </p>
                    <p className="text-base font-medium italic text-black leading-relaxed">
                      "{c.example}"
                    </p>
                  </div>
                )}

                {c.meaning && (
                  <div className="pl-4 border-l-2 border-black">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">
                      Giải nghĩa:
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {c.meaning}
                    </p>
                  </div>
                )}
              </div>

              {c.status === "rejected" && c.reject_reason && (
                <div className="bg-red-50 border-2 border-black p-4 mb-8 flex items-start gap-3">
                  <i className="fa-solid fa-circle-exclamation text-nung-red mt-1"></i>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-nung-red mb-1">
                      Lý do từ chối:
                    </p>
                    <p className="text-sm font-medium text-red-900">
                      {c.reject_reason}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-6 border-t-2 border-gray-100">
                {c.status === "pending" && (
                  <>
                    <button
                      onClick={() => setEditingContribution(c)}
                      className="px-4 py-2 bg-white border-2 border-black font-bold uppercase text-[10px] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-pen"></i> Hiệu đính
                    </button>
                    <button
                      onClick={() => handleApproveClick(c.id)}
                      className="px-4 py-2 bg-green-400 border-2 border-black font-bold uppercase text-[10px] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-check"></i> Phê duyệt
                    </button>
                    <button
                      onClick={() => handleRejectClick(c.id)}
                      className="px-4 py-2 bg-amber-400 border-2 border-black font-bold uppercase text-[10px] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-ban"></i> Từ chối
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDeleteClick(c.id)}
                  className="px-4 py-2 bg-white text-nung-red border-2 border-black font-bold uppercase text-[10px] shadow-brutal-sm hover:bg-nung-red hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-trash"></i> Xóa
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
