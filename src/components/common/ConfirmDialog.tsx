import React from "react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = "danger",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      bg: "bg-nung-red",
      icon: "fa-trash",
      iconColor: "text-white",
      btnBg: "bg-nung-red",
    },
    warning: {
      bg: "bg-amber-400",
      icon: "fa-exclamation-triangle",
      iconColor: "text-black",
      btnBg: "bg-amber-400",
    },
    info: {
      bg: "bg-nung-blue",
      icon: "fa-info-circle",
      iconColor: "text-white",
      btnBg: "bg-nung-blue",
    },
  };

  const config = iconConfig[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white border-2 border-black shadow-brutal w-full max-w-sm animate-in fade-in zoom-in duration-200">
        <div className="p-8">
          {/* Icon */}
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center border-2 border-black ${config.bg} mb-6`}
          >
            <i
              className={`fa-solid ${config.icon} text-2xl ${config.iconColor}`}
            />
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-xl font-bold uppercase tracking-tight mb-2">
              {title}
            </h3>
            <p className="text-gray-500 font-medium text-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 border-t-2 border-black p-4 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border-2 border-black bg-white font-bold uppercase text-[10px] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 border-2 border-black font-bold uppercase text-[10px] text-white ${config.btnBg} shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
