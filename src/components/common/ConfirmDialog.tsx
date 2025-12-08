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
      bg: "bg-red-100",
      icon: "fa-trash-can",
      iconColor: "text-red-600",
      btnBg: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      bg: "bg-amber-100",
      icon: "fa-triangle-exclamation",
      iconColor: "text-amber-600",
      btnBg: "bg-amber-600 hover:bg-amber-700",
    },
    info: {
      bg: "bg-blue-100",
      icon: "fa-circle-info",
      iconColor: "text-blue-600",
      btnBg: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const config = iconConfig[type];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all w-full max-w-md animate-fade-in">
          <div className="p-6">
            {/* Icon */}
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${config.bg} mb-4`}
            >
              <i
                className={`fa-solid ${config.icon} text-2xl ${config.iconColor}`}
              ></i>
            </div>

            {/* Content */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-earth-900 mb-2">{title}</h3>
              <p className="text-earth-600">{message}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-earth-50 px-6 py-4 flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl font-medium text-earth-700 bg-white border border-earth-300 hover:bg-earth-100 transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-5 py-2.5 rounded-xl font-medium text-white ${config.btnBg} transition-all shadow-md hover:shadow-lg`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
