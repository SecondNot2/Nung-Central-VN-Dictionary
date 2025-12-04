import React, { useState, useEffect, useCallback } from "react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: "bg-emerald-50 border-emerald-500",
      icon: "fa-circle-check",
      iconColor: "text-emerald-500",
      textColor: "text-emerald-800",
    },
    error: {
      bg: "bg-red-50 border-red-500",
      icon: "fa-circle-xmark",
      iconColor: "text-red-500",
      textColor: "text-red-800",
    },
    warning: {
      bg: "bg-amber-50 border-amber-500",
      icon: "fa-triangle-exclamation",
      iconColor: "text-amber-500",
      textColor: "text-amber-800",
    },
    info: {
      bg: "bg-blue-50 border-blue-500",
      icon: "fa-circle-info",
      iconColor: "text-blue-500",
      textColor: "text-blue-800",
    },
  };

  const style = config[toast.type];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 shadow-lg ${style.bg} animate-slide-in-right min-w-[280px] max-w-[400px]`}
    >
      <i className={`fa-solid ${style.icon} text-lg ${style.iconColor}`}></i>
      <p className={`flex-1 font-medium text-sm ${style.textColor}`}>
        {toast.message}
      </p>
      <button
        onClick={onClose}
        className={`${style.iconColor} hover:opacity-70 transition-opacity p-1`}
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  removeToast,
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: Toast["type"] = "info") => {
      const id =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};

export default ToastContainer;
