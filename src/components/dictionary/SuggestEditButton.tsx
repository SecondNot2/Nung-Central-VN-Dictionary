import React, { useState, useEffect } from "react";
import { createSuggestion } from "../../services/api/suggestionService";
import { User, TranslationResult } from "../../types";

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
        className="flex items-center gap-2 text-sm font-black text-gray-500 hover:text-nung-red transition-all px-4 py-2 border-2 border-black bg-white shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none uppercase tracking-widest"
        title="Đề xuất chỉnh sửa bản dịch"
      >
        <i className="fa-solid fa-pen-to-square" />
        <span className="hidden sm:inline">Góp ý</span>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !submitting && setIsModalOpen(false)}
          />

          <div className="relative bg-white border-4 border-black shadow-brutal-lg w-full max-w-lg overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b-4 border-black bg-nung-red text-white">
              <div>
                <h2 className="text-2xl font-display font-bold uppercase tracking-tight">
                  <i className="fa-solid fa-pen-to-square mr-3" />
                  Đề xuất chỉnh sửa
                </h2>
                <p className="text-xs font-bold text-white/70 mt-1 uppercase tracking-widest">
                  Góp phần cải thiện chất lượng bản dịch
                </p>
              </div>
              <button
                onClick={() => !submitting && setIsModalOpen(false)}
                disabled={submitting}
                className="w-10 h-10 border-2 border-white flex items-center justify-center hover:bg-white hover:text-nung-red transition-colors shadow-brutal-sm active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                <i className="fa-solid fa-xmark text-xl" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto bg-paper">
              {/* Original Text */}
              <div>
                <label className="text-xs font-black text-nung-red uppercase tracking-widest block mb-1">
                  Văn bản gốc
                </label>
                <div className="text-nung-dark bg-white border-2 border-black p-4 font-body font-bold shadow-brutal-sm">
                  {originalText}
                </div>
              </div>

              {/* Original Translation */}
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-1">
                  Bản dịch hiện tại
                </label>
                <div className="bg-gray-100 border-2 border-black p-4">
                  <p className="text-gray-900 font-bold">
                    {originalTranslation.script}
                  </p>
                  {originalTranslation.phonetic && (
                    <p className="text-nung-blue text-sm italic font-medium mt-1">
                      {originalTranslation.phonetic}
                    </p>
                  )}
                </div>
              </div>

              {/* Suggested Translation */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-nung-blue uppercase tracking-widest block mb-2">
                    Bản dịch đề xuất <span className="text-nung-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={suggestedScript}
                    onChange={(e) => setSuggestedScript(e.target.value)}
                    placeholder="Nhập văn bản dịch mới..."
                    className="w-full px-4 py-3 border-4 border-black outline-none focus:bg-nung-sand/10 text-nung-dark font-bold text-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-nung-blue uppercase tracking-widest block mb-2">
                    Phiên âm (nếu có)
                  </label>
                  <input
                    type="text"
                    value={suggestedPhonetic}
                    onChange={(e) => setSuggestedPhonetic(e.target.value)}
                    placeholder="Phiên âm ngữ âm..."
                    className="w-full px-4 py-3 border-4 border-black outline-none focus:bg-nung-sand/10 text-nung-dark font-medium"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">
                  Lý do chỉnh sửa
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Giải thích tại sao bạn đề xuất thay đổi này..."
                  rows={3}
                  className="w-full px-4 py-3 border-4 border-black outline-none focus:bg-nung-sand/10 text-nung-dark resize-none font-medium"
                />
              </div>

              {/* Toast */}
              {toast && (
                <div
                  className={`px-4 py-3 border-2 border-black shadow-brutal-sm flex items-center gap-3 animate-fade-in ${
                    toast.type === "success"
                      ? "bg-nung-green text-white"
                      : "bg-nung-red text-white"
                  }`}
                >
                  <i
                    className={`fa-solid ${
                      toast.type === "success"
                        ? "fa-check-circle"
                        : "fa-triangle-exclamation"
                    }`}
                  />
                  <span className="text-sm font-bold uppercase tracking-tight">
                    {toast.message}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t-4 border-black bg-white flex justify-end gap-4 shadow-[0_-4px_0_0_#000]">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="px-6 py-3 font-bold text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmit}
                disabled={!suggestedScript.trim() || submitting}
                className="px-8 py-3 bg-nung-red text-white border-2 border-black font-black uppercase tracking-widest shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && (
                  <i className="fa-solid fa-circle-notch fa-spin" />
                )}
                Gửi đóng góp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SuggestEditButton;
