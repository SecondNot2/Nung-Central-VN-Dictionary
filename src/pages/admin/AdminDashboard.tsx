import React, { useState, useEffect } from "react";
import { AppRoute, User } from "../../types";
import { getStats, UserStats } from "../../services/api/userManagementService";
import { ToastContainer, useToast } from "../../components";
import {
  supabase,
  isSupabaseConfigured,
} from "../../services/api/supabaseClient";

interface AdminDashboardProps {
  user: User | null;
  setRoute: (route: AppRoute) => void;
}

interface PendingCounts {
  contributions: number;
  suggestions: number;
  reports: number;
  feedback: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, setRoute }) => {
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalContributors: 0,
    recentSignups: 0,
  });
  const [pendingCounts, setPendingCounts] = useState<PendingCounts>({
    contributions: 0,
    suggestions: 0,
    reports: 0,
    feedback: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    loadStats();
    loadPendingCounts();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const data = await getStats();
    setStats(data);
    setLoading(false);
  };

  const loadPendingCounts = async () => {
    if (!isSupabaseConfigured()) return;

    try {
      // Fetch pending contributions count
      const { count: contribCount } = await supabase
        .from("contributions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Fetch pending suggestions count
      const { count: suggCount } = await supabase
        .from("translation_suggestions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Fetch pending reports count
      const { count: reportCount } = await supabase
        .from("discussion_reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Fetch new feedback count
      const { count: feedbackCount } = await supabase
        .from("feedback")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");

      setPendingCounts({
        contributions: contribCount || 0,
        suggestions: suggCount || 0,
        reports: reportCount || 0,
        feedback: feedbackCount || 0,
      });
    } catch (err) {
      console.error("Error loading pending counts:", err);
    }
  };

  // Check admin access
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-earth-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <i className="fa-solid fa-lock text-4xl text-earth-400 mb-4" />
          <h2 className="text-xl font-bold text-earth-900 mb-2">
            Truy cập bị từ chối
          </h2>
          <p className="text-earth-600 mb-4">
            Bạn cần quyền quản trị viên để truy cập trang này.
          </p>
          <button
            onClick={() => setRoute(AppRoute.DICTIONARY)}
            className="px-6 py-2 bg-bamboo-600 text-white rounded-lg hover:bg-bamboo-700 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Tổng người dùng",
      value: stats.totalUsers,
      icon: "fa-users",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Quản trị viên",
      value: stats.totalAdmins,
      icon: "fa-user-shield",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Cộng tác viên",
      value: stats.totalContributors,
      icon: "fa-user-pen",
      color: "from-bamboo-500 to-bamboo-600",
      bgColor: "bg-bamboo-50",
    },
    {
      title: "Đăng ký mới (7 ngày)",
      value: stats.recentSignups,
      icon: "fa-user-plus",
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  const quickActions = [
    {
      title: "Quản lý người dùng",
      description: "Xem, chỉnh sửa và xóa tài khoản",
      icon: "fa-users-gear",
      route: AppRoute.ADMIN_USERS,
      color: "text-blue-600",
      pendingCount: 0,
    },
    {
      title: "Quản lý từ điển",
      description: "Thêm, sửa, xóa từ vựng",
      icon: "fa-book",
      route: AppRoute.ADMIN_DICTIONARY,
      color: "text-bamboo-600",
      pendingCount: 0,
    },
    {
      title: "Duyệt đóng góp",
      description: "Xem và phê duyệt đóng góp từ vựng",
      icon: "fa-clipboard-check",
      route: AppRoute.ADMIN,
      color: "text-purple-600",
      pendingCount: pendingCounts.contributions,
    },
    {
      title: "Quản lý đề xuất chỉnh sửa",
      description: "Duyệt các đề xuất chỉnh sửa bản dịch",
      icon: "fa-pen-to-square",
      route: AppRoute.ADMIN_SUGGESTIONS,
      color: "text-amber-600",
      pendingCount: pendingCounts.suggestions,
    },
    {
      title: "Quản lý báo cáo bình luận",
      description: "Xử lý các bình luận bị báo cáo vi phạm",
      icon: "fa-flag",
      route: AppRoute.ADMIN_REPORTS,
      color: "text-red-600",
      pendingCount: pendingCounts.reports,
    },
    {
      title: "Quản lý phản hồi",
      description: "Xem góp ý và báo lỗi từ người dùng",
      icon: "fa-comment-dots",
      route: AppRoute.ADMIN_FEEDBACK,
      color: "text-cyan-600",
      pendingCount: pendingCounts.feedback,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 via-white to-bamboo-50/30">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-earth-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-earth-900">
                Dashboard Quản trị
              </h1>
              <p className="text-earth-600 text-sm">Xin chào, {user.name}!</p>
            </div>
            <button
              onClick={() => {
                loadStats();
                loadPendingCounts();
              }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-earth-100 hover:bg-earth-200 rounded-lg transition-colors text-earth-700"
            >
              <i className={`fa-solid fa-rotate ${loading ? "fa-spin" : ""}`} />
              Làm mới
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div
              key={index}
              className={`${card.bgColor} rounded-2xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all cursor-pointer group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <i className={`fa-solid ${card.icon} text-white text-lg`} />
                </div>
                {loading && (
                  <i className="fa-solid fa-circle-notch fa-spin text-earth-400" />
                )}
              </div>
              <p className="text-3xl font-bold text-earth-900 mb-1">
                {loading ? "—" : card.value}
              </p>
              <p className="text-sm text-earth-600">{card.title}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-earth-900 mb-4">
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setRoute(action.route)}
                className="bg-white rounded-xl p-6 border border-earth-200/50 text-left hover:border-bamboo-300 hover:shadow-lg transition-all group cursor-pointer relative"
              >
                {/* Pending Badge */}
                {action.pendingCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {action.pendingCount > 99 ? "99+" : action.pendingCount}
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-earth-100 flex items-center justify-center group-hover:bg-bamboo-50 transition-colors relative`}
                  >
                    <i
                      className={`fa-solid ${action.icon} text-xl ${action.color}`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-earth-900 mb-1 group-hover:text-bamboo-700 transition-colors flex items-center gap-2">
                      {action.title}
                      {action.pendingCount > 0 && (
                        <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          {action.pendingCount} chờ duyệt
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-earth-500">
                      {action.description}
                    </p>
                  </div>
                  <i className="fa-solid fa-chevron-right text-earth-300 group-hover:text-bamboo-500 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white rounded-2xl p-6 border border-earth-200/50">
          <h2 className="text-lg font-semibold text-earth-900 mb-4">
            Hoạt động gần đây
          </h2>
          <div className="text-center py-8 text-earth-400">
            <i className="fa-solid fa-clock-rotate-left text-4xl mb-3" />
            <p>Chức năng đang được phát triển</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
