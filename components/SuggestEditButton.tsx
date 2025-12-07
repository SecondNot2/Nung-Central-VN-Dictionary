import React, { useState, useEffect } from "react";
import { createSuggestion } from "../services/suggestionService";
import { User, TranslationResult } from "../types";

interface SuggestEditButtonProps {
  user: User | null;
  originalText: string;
  sourceLang: string;
  targetLang: string;
  result: TranslationResult;
  onLoginRequired?: () => void;
  onSuccess?: () => void;
}

const SuggestEditButton: React.FC<SuggestEditButtonProps> = ({
  user,
  originalText,
  sourceLang,
  targetLang,
  result,
  onLoginRequired,
  onSuccess,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestedScript, setSuggestedScript] = useState("");
  const [suggestedPhonetic, setSuggestedPhonetic] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const originalTranslation = result.translations[0];

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isModalOpen]);

  const handleOpen = () => {
    if (!user) {
      onLoginRequired?.();
      return;
    }
    setSuggestedScript(originalTranslation.script);
    setSuggestedPhonetic(originalTranslation.phonetic || "");
    setReason("");
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!user) return;

    const suggestedTranslation = `${suggestedScript}${
      suggestedPhonetic ? ` (${suggestedPhonetic})` : ""
    }`;

    if (
      suggestedTranslation ===
      `${originalTranslation.script}${
        originalTranslation.phonetic ? ` (${originalTranslation.phonetic})` : ""
      }`
    ) {
      setToast({
        message: "Vui lòng nhập bản dịch khác với bản gốc",
        type: "error",
      });
      return;
    }

    setSubmitting(true);
    const created = await createSuggestion(
      user.id,
      originalText,
      sourceLang,
      targetLang,
      `${originalTranslation.script} (${originalTranslation.phonetic})`,
      suggestedTranslation,
      reason
    );

    if (created) {
      setToast({ message: "Đã gửi đề xuất chỉnh sửa!", type: "success" });
      setTimeout(() => {
        setIsModalOpen(false);
        onSuccess?.();
      }, 1500);
    } else {
      setToast({
        message: "Không thể gửi đề xuất. Vui lòng thử lại.",
        type: "error",
      });
    }
    setSubmitting(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 text-sm text-earth-500 hover:text-bamboo-600 transition-colors px-2 py-1 rounded hover:bg-earth-50"
        title="Đề xuất chỉnh sửa bản dịch"
      >
        <i className="fa-solid fa-pen-to-square" />
        <span className="hidden sm:inline">Đề xuất chỉnh sửa</span>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !submitting && setIsModalOpen(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-earth-200 bg-gradient-to-r from-bamboo-50 to-earth-50">
              <div>
                <h2 className="text-lg font-bold text-earth-900">
                  <i className="fa-solid fa-pen-to-square mr-2 text-bamboo-600" />
                  Đề xuất chỉnh sửa
                </h2>
                <p className="text-xs text-earth-500 mt-0.5">
                  Góp phần cải thiện chất lượng bản dịch
                </p>
              </div>
              <button
                onClick={() => !submitting && setIsModalOpen(false)}
                disabled={submitting}
                className="w-8 h-8 rounded-full hover:bg-earth-200 flex items-center justify-center transition-colors"
              >
                <i className="fa-solid fa-xmark text-earth-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Original Text */}
              <div>
                <label className="text-xs font-semibold text-earth-500 uppercase tracking-wide block mb-1">
                  Văn bản gốc
                </label>
                <p className="text-earth-800 bg-earth-50 px-3 py-2 rounded-lg text-sm">
                  {originalText}
                </p>
              </div>

              {/* Original Translation */}
              <div>
                <label className="text-xs font-semibold text-earth-500 uppercase tracking-wide block mb-1">
                  Bản dịch hiện tại
                </label>
                <div className="bg-earth-50 px-3 py-2 rounded-lg">
                  <p className="text-earth-800 font-medium">
                    {originalTranslation.script}
                  </p>
                  {originalTranslation.phonetic && (
                    <p className="text-bamboo-600 text-sm italic">
                      {originalTranslation.phonetic}
                    </p>
                  )}
                </div>
              </div>

              {/* Suggested Translation */}
              <div>
                <label className="text-xs font-semibold text-earth-500 uppercase tracking-wide block mb-1">
                  Bản dịch đề xuất <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={suggestedScript}
                  onChange={(e) => setSuggestedScript(e.target.value)}
                  placeholder="Nhập văn bản dịch mới..."
                  className="w-full px-3 py-2 border border-earth-200 rounded-lg outline-none focus:ring-2 focus:ring-bamboo-500 focus:border-transparent text-earth-800"
                />
                <input
                  type="text"
                  value={suggestedPhonetic}
                  onChange={(e) => setSuggestedPhonetic(e.target.value)}
                  placeholder="Phiên âm (nếu có)..."
                  className="w-full px-3 py-2 border border-earth-200 rounded-lg outline-none focus:ring-2 focus:ring-bamboo-500 focus:border-transparent text-earth-800 mt-2 text-sm"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs font-semibold text-earth-500 uppercase tracking-wide block mb-1">
                  Lý do chỉnh sửa (không bắt buộc)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Giải thích tại sao bạn đề xuất thay đổi này..."
                  rows={3}
                  className="w-full px-3 py-2 border border-earth-200 rounded-lg outline-none focus:ring-2 focus:ring-bamboo-500 focus:border-transparent text-earth-800 resize-none text-sm"
                />
              </div>

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
            <div className="px-6 py-4 border-t border-earth-200 bg-earth-50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="px-4 py-2 text-sm text-earth-600 hover:bg-earth-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={!suggestedScript.trim() || submitting}
                className="px-4 py-2 text-sm bg-bamboo-600 text-white rounded-lg hover:bg-bamboo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {submitting && (
                  <i className="fa-solid fa-circle-notch fa-spin" />
                )}
                Gửi đề xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SuggestEditButton;
