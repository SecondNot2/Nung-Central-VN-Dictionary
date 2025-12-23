import React from "react";
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
  return (
    <div className="flex bg-white min-h-screen font-sans text-black overflow-x-hidden">
      <AdminSidebar
        currentRoute={currentRoute}
        setRoute={setRoute}
        onLogout={onLogout}
      />
      <main className="flex-grow ml-64 min-h-screen relative bg-white">
        {/* Work Area with padding */}
        <div className="p-8 lg:p-12">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
