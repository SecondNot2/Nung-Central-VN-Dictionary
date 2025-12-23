import React from "react";
import { AppRoute } from "../../types";

interface AdminSidebarProps {
  currentRoute: AppRoute;
  setRoute: (route: AppRoute) => void;
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentRoute,
  setRoute,
  onLogout,
  isOpen,
  onClose,
}) => {
  const handleMenuClick = (route: AppRoute) => {
    setRoute(route);
    if (onClose) onClose();
  };

  const menuItems = [
    { id: AppRoute.ADMIN_DASHBOARD, label: "Tổng quan", icon: "fa-gauge-high" },
    { id: AppRoute.ADMIN_DICTIONARY, label: "Từ điển", icon: "fa-book" },
    { id: AppRoute.ADMIN, label: "Đóng góp", icon: "fa-hand-holding-heart" },
    {
      id: AppRoute.ADMIN_SUGGESTIONS,
      label: "Đề xuất",
      icon: "fa-pen-to-square",
    },
    { id: AppRoute.ADMIN_USERS, label: "Người dùng", icon: "fa-users" },
    { id: AppRoute.ADMIN_REPORTS, label: "Báo cáo", icon: "fa-flag" },
    { id: AppRoute.ADMIN_FEEDBACK, label: "Góp ý", icon: "fa-comment-dots" },
  ];

  return (
    <aside
      className={`w-64 min-h-screen bg-white border-r-4 border-black fixed left-0 top-0 z-40 flex flex-col overflow-hidden transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? "translate-x-0 shadow-brutal-lg" : "-translate-x-full"
      }`}
    >
      {/* Brand */}
      <div className="p-6 border-b-4 border-black flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black shadow-brutal-sm shrink-0">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <span className="font-black uppercase tracking-tighter text-xl">
            Admin Panel
          </span>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden w-8 h-8 border-2 border-black flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
        <div className="px-3 mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Điều hướng
          </p>
        </div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 border-2 transition-all font-bold text-sm ${
              currentRoute === item.id
                ? "bg-black text-white border-black"
                : "border-transparent hover:border-black hover:bg-gray-50 text-gray-700"
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5 text-center`} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer / Back to User Site */}
      <div className="p-4 border-t-4 border-black space-y-2">
        <button
          onClick={() => handleMenuClick(AppRoute.DICTIONARY)}
          className="w-full flex items-center gap-3 px-4 py-3 border-2 border-black bg-white text-black font-bold text-xs shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          <i className="fa-solid fa-house"></i>
          <span>Về trang người dùng</span>
        </button>
        {onLogout && (
          <button
            onClick={() => {
              onLogout();
              if (onClose) onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 border-2 border-black bg-nung-red text-white font-bold text-xs shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Đăng xuất</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;
