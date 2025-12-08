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
      icon: "fa-bug",
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      id: "feature" as FeedbackType,
      label: "Yêu cầu tính năng",
      icon: "fa-lightbulb",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      id: "suggestion" as FeedbackType,
      label: "Góp ý khác",
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !submitting && onClose()}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div
          className={`px-6 py-4 border-b border-earth-200 ${currentTab.bgColor}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-earth-900 flex items-center gap-2">
                <i
                  className={`fa-solid ${currentTab.icon} ${currentTab.color}`}
                />
                Góp ý & Báo lỗi
              </h2>
              <p className="text-xs text-earth-500 mt-0.5">
                {user ? `Đăng nhập với: ${user.email}` : "Gửi ẩn danh"}
              </p>
            </div>
            <button
              onClick={() => !submitting && onClose()}
              disabled={submitting}
              className="w-8 h-8 rounded-full hover:bg-white/50 flex items-center justify-center transition-colors"
            >
              <i className="fa-solid fa-xmark text-earth-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 -mb-4 -mx-6 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-earth-900 shadow-sm"
                    : "text-earth-600 hover:bg-white/50"
                }`}
              >
                <i
                  className={`fa-solid ${tab.icon} ${
                    activeTab === tab.id ? tab.color : ""
                  }`}
                />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                activeTab === "bug"
                  ? "VD: Lỗi không hiển thị kết quả dịch..."
                  : activeTab === "feature"
                  ? "VD: Thêm chức năng dịch giọng nói..."
                  : "VD: Đề xuất cải thiện giao diện..."
              }
              className="w-full px-4 py-2.5 border border-earth-200 rounded-lg outline-none focus:ring-2 focus:ring-bamboo-500 focus:border-transparent text-earth-800"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                activeTab === "bug"
                  ? "Mô tả chi tiết lỗi bạn gặp phải, các bước để tái hiện lỗi..."
                  : activeTab === "feature"
                  ? "Mô tả chi tiết tính năng bạn mong muốn..."
                  : "Chia sẻ góp ý của bạn..."
              }
              rows={4}
              className="w-full px-4 py-2.5 border border-earth-200 rounded-lg outline-none focus:ring-2 focus:ring-bamboo-500 focus:border-transparent text-earth-800 resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1">
              Danh mục
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(category === cat ? "" : cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    category === cat
                      ? "bg-bamboo-600 text-white"
                      : "bg-earth-100 text-earth-600 hover:bg-earth-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Priority (only for bugs) */}
          {activeTab === "bug" && (
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1">
                Mức độ nghiêm trọng
              </label>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPriority(opt.value as Priority)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      priority === opt.value
                        ? `${opt.color} ring-2 ring-offset-1 ring-current`
                        : "bg-earth-100 text-earth-600 hover:bg-earth-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toast */}
          {toast && (
            <div
              className={`px-4 py-3 rounded-lg flex items-center gap-2 ${
                toast.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <i
                className={`fa-solid ${
                  toast.type === "success"
                    ? "fa-check-circle"
                    : "fa-times-circle"
                }`}
              />
              <span className="text-sm">{toast.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-earth-200 bg-earth-50 flex justify-between items-center">
          <p className="text-xs text-earth-400">
            {!user && (
              <>
                <i className="fa-solid fa-info-circle mr-1" />
                Bạn đang gửi ẩn danh
              </>
            )}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm text-earth-600 hover:bg-earth-200 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !description.trim() || submitting}
              className="px-5 py-2 text-sm bg-bamboo-600 text-white rounded-lg hover:bg-bamboo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {submitting && <i className="fa-solid fa-circle-notch fa-spin" />}
              Gửi phản hồi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
