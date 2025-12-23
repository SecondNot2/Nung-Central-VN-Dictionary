import React, { useState } from "react";
import AdminSidebar from "../admin/AdminSidebar";
import { AppRoute, User } from "../../types";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentRoute: AppRoute;
  setRoute: (route: AppRoute) => void;
  user: User | null;
  onLogout?: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  currentRoute,
  setRoute,
  user,
  onLogout,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex bg-white min-h-screen font-sans text-black overflow-x-hidden relative">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <AdminSidebar
        currentRoute={currentRoute}
        setRoute={setRoute}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      <div className="flex-grow flex flex-col min-h-screen min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b-4 border-black bg-white flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center border-2 border-black">
              <i className="fa-solid fa-shield-halved text-sm"></i>
            </div>
            <span className="font-black uppercase tracking-tighter text-lg">
              Admin
            </span>
          </div>

          <button
            onClick={toggleSidebar}
            className="w-10 h-10 border-2 border-black flex items-center justify-center bg-white shadow-brutal-xs active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <i
              className={`fa-solid ${isSidebarOpen ? "fa-xmark" : "fa-bars"}`}
            ></i>
          </button>
        </header>

        <main className="flex-grow lg:ml-64 relative bg-white transition-all min-w-0 overflow-x-hidden">
          {/* Work Area with padding */}
          <div className="p-4 md:p-8 lg:p-12 w-full max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
