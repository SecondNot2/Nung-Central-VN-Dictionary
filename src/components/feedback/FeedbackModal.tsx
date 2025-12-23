import React, { useState, useEffect } from "react";
import { User } from "../../types";
import { createFeedback } from "../../services/api/feedbackService";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

type FeedbackType = "bug" | "feature" | "suggestion";
type Priority = "low" | "medium" | "high" | "critical";

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [activeTab, setActiveTab] = useState<FeedbackType>("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Reset form when tab changes
  useEffect(() => {
    setTitle("");
    setDescription("");
    setCategory("");
    setPriority("medium");
    setToast(null);
  }, [activeTab]);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setToast({ message: "Vui lòng điền đầy đủ thông tin", type: "error" });
      return;
    }

    setSubmitting(true);

    const feedback = await createFeedback(
      user?.id || null,
      activeTab,
      title.trim(),
      description.trim(),
      category || undefined,
      priority
    );

    if (feedback) {
      setToast({
        message: "Cảm ơn bạn đã góp ý! Chúng tôi sẽ xem xét sớm nhất.",
        type: "success",
      });
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setPriority("medium");
      // Close after delay
      setTimeout(() => {
        onClose();
        setToast(null);
      }, 2000);
    } else {
      setToast({
        message: "Không thể gửi phản hồi. Vui lòng thử lại.",
        type: "error",
      });
    }

    setSubmitting(false);
  };

  if (!isOpen) return null;

  const tabs = [
    {
      id: "bug" as FeedbackType,
      label: "Báo lỗi",
      shortLabel: "Lỗi",
      icon: "fa-bug",
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      id: "feature" as FeedbackType,
      label: "Yêu cầu tính năng",
      shortLabel: "Tính năng",
      icon: "fa-lightbulb",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      id: "suggestion" as FeedbackType,
      label: "Góp ý khác",
      shortLabel: "Góp ý",
      icon: "fa-comment",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
  ];

  const categories =
    activeTab === "bug"
      ? ["Dịch thuật", "Giao diện", "Hiệu năng", "Đăng nhập", "Khác"]
      : activeTab === "feature"
      ? ["Tính năng mới", "Cải tiến", "Tích hợp", "Khác"]
      : ["Nội dung", "Thiết kế", "Trải nghiệm", "Khác"];

  const priorityOptions = [
    { value: "low", label: "Thấp", color: "bg-gray-100 text-gray-600" },
    {
      value: "medium",
      label: "Trung bình",
      color: "bg-blue-100 text-blue-600",
    },
    { value: "high", label: "Cao", color: "bg-orange-100 text-orange-600" },
    {
      value: "critical",
      label: "Nghiêm trọng",
      color: "bg-red-100 text-red-600",
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop (Lite) */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !submitting && onClose()}
      />

      {/* Modal (Lite) */}
      <div className="relative bg-white border-2 border-black shadow-brutal w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-black text-white px-6 py-4 flex items-center justify-between border-b-2 border-black">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-3">
              <i className={`fa-solid ${currentTab.icon}`} />
              Góp ý & Báo lỗi
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
              {user ? `Người dùng: ${user.email}` : "Chế độ ẩn danh"}
            </p>
          </div>
          <button
            onClick={() => !submitting && onClose()}
            disabled={submitting}
            className="w-10 h-10 border-2 border-white bg-white text-black flex items-center justify-center hover:bg-nung-red hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Tabs (Lite) */}
        <div className="flex border-b-2 border-black bg-gray-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-2 font-black uppercase text-[10px] tracking-widest transition-all border-r-2 border-black last:border-r-0 ${
                activeTab === tab.id
                  ? "bg-white text-black translate-y-[2px]"
                  : "bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100"
              }`}
            >
              <i className={`fa-solid ${tab.icon} mb-1 block text-sm`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              Tiêu đề <span className="text-nung-red">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Lỗi không hiển thị kết quả..."
              className="w-full px-4 py-3 border-2 border-black font-bold focus:bg-gray-50 outline-none transition-all placeholder:text-gray-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              Mô tả chi tiết <span className="text-nung-red">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Chia sẻ góp ý của bạn..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-black font-bold focus:bg-gray-50 outline-none transition-all resize-none placeholder:text-gray-300"
            />
          </div>

          {/* Category Selector (Lite) */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              Danh mục
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(category === cat ? "" : cat)}
                  className={`px-3 py-1.5 border-2 border-black font-bold uppercase text-[10px] tracking-widest transition-all ${
                    category === cat
                      ? "bg-black text-white shadow-none"
                      : "bg-white text-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Priority (only for bugs) */}
          {activeTab === "bug" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Mức độ nghiêm trọng
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPriority(opt.value as Priority)}
                    className={`px-2 py-2 border-2 border-black font-bold uppercase text-[9px] tracking-widest transition-all ${
                      priority === opt.value
                        ? "bg-black text-white"
                        : "bg-white text-black shadow-brutal-sm hover:bg-gray-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toast Notification (Inside) */}
          {toast && (
            <div
              className={`p-4 border-2 border-black font-bold uppercase text-[10px] tracking-widest flex items-center gap-3 animate-in zoom-in duration-200 ${
                toast.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <i
                className={`fa-solid ${
                  toast.type === "success"
                    ? "fa-check"
                    : "fa-triangle-exclamation"
                }`}
              />
              {toast.message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t-2 border-black bg-gray-50 flex justify-between items-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            {!user && (
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-ghost" /> Ghé thăm
              </span>
            )}
          </p>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2 border-2 border-black bg-white font-bold uppercase text-[10px] tracking-widest shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !description.trim() || submitting}
              className="px-6 py-2 border-2 border-black bg-black text-white font-bold uppercase text-[10px] tracking-widest shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting && <i className="fa-solid fa-circle-notch fa-spin" />}
              Gửi ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
