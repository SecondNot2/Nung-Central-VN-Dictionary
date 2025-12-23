import React, { useState, useEffect } from "react";
import { AppRoute, User } from "../../types";
import { getStats, UserStats } from "../../services/api/userManagementService";
import { ToastContainer, useToast, RecentActivityList } from "../../components";
import {
  supabase,
  isSupabaseConfigured,
} from "../../services/api/supabaseClient";
import {
  getRecentActivities,
  ActivityItem,
} from "../../services/api/activityService";

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
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    loadStats();
    loadPendingCounts();
    loadActivities();
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

  const loadActivities = async () => {
    setActivitiesLoading(true);
    try {
      const data = await getRecentActivities(15);
      setActivities(data);
    } catch (err) {
      console.error("Error loading activities:", err);
      addToast("Không thể tải hoạt động gần đây", "error");
    }
    setActivitiesLoading(false);
  };

  const handleRefresh = () => {
    loadStats();
    loadPendingCounts();
    loadActivities();
  };

  // Check admin access
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center p-12 bg-white border-2 border-black shadow-brutal-sm max-w-md w-full">
          <div className="w-16 h-16 bg-nung-red border-2 border-black flex items-center justify-center mx-auto mb-8">
            <i className="fa-solid fa-lock text-3xl text-white" />
          </div>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-black mb-4">
            Truy cập bị từ chối
          </h2>
          <p className="text-gray-500 font-medium italic mb-8">
            Bạn cần quyền quản trị viên để truy cập trang này.
          </p>
          <button
            onClick={() => setRoute(AppRoute.DICTIONARY)}
            className="w-full px-8 py-4 bg-black text-white border-2 border-black font-bold uppercase tracking-widest text-xs shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
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
      color: "bg-blue-400",
      iconColor: "text-black",
    },
    {
      title: "Quản trị viên",
      value: stats.totalAdmins,
      icon: "fa-user-shield",
      color: "bg-nung-red",
      iconColor: "text-white",
    },
    {
      title: "Cộng tác viên",
      value: stats.totalContributors,
      icon: "fa-user-pen",
      color: "bg-nung-blue",
      iconColor: "text-white",
    },
    {
      title: "Đăng ký mới (7 ngày)",
      value: stats.recentSignups,
      icon: "fa-user-plus",
      color: "bg-amber-400",
      iconColor: "text-black",
    },
  ];

  const quickActions = [
    {
      title: "Quản lý người dùng",
      description: "Xem, chỉnh sửa và xóa tài khoản",
      icon: "fa-users-gear",
      route: AppRoute.ADMIN_USERS,
      color: "bg-white",
      iconBg: "bg-blue-400",
      pendingCount: 0,
    },
    {
      title: "Quản lý từ điển",
      description: "Thêm, sửa, xóa từ vựng",
      icon: "fa-book",
      route: AppRoute.ADMIN_DICTIONARY,
      color: "bg-white",
      iconBg: "bg-nung-blue",
      pendingCount: 0,
    },
    {
      title: "Duyệt đóng góp",
      description: "Xem và phê duyệt đóng góp từ vựng",
      icon: "fa-clipboard-check",
      route: AppRoute.ADMIN,
      color: "bg-white",
      iconBg: "bg-nung-red",
      pendingCount: pendingCounts.contributions,
    },
    {
      title: "Quản lý đề xuất chỉnh sửa",
      description: "Duyệt các đề xuất chỉnh sửa bản dịch",
      icon: "fa-pen-to-square",
      route: AppRoute.ADMIN_SUGGESTIONS,
      color: "bg-white",
      iconBg: "bg-amber-400",
      pendingCount: pendingCounts.suggestions,
    },
    {
      title: "Quản lý báo cáo bình luận",
      description: "Xử lý các bình luận bị báo cáo vi phạm",
      icon: "fa-flag",
      route: AppRoute.ADMIN_REPORTS,
      color: "bg-white",
      iconBg: "bg-gray-800",
      pendingCount: pendingCounts.reports,
    },
    {
      title: "Quản lý phản hồi",
      description: "Xem góp ý và báo lỗi từ người dùng",
      icon: "fa-comment-dots",
      route: AppRoute.ADMIN_FEEDBACK,
      color: "bg-white",
      iconBg: "bg-cyan-400",
      pendingCount: pendingCounts.feedback,
    },
  ];

  return (
    <div className="bg-white text-black">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header Container */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center">
            <div className="w-12 h-12 border-2 border-black bg-black text-white flex items-center justify-center mr-4">
              <i className="fa-solid fa-gauge-high text-xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-tight">
                Dashboard
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                Chào mừng,{" "}
                <span className="text-black font-bold">{user.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading || activitiesLoading}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-black font-bold uppercase tracking-widest text-xs shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
          >
            <i
              className={`fa-solid fa-rotate ${
                loading || activitiesLoading ? "fa-spin" : ""
              }`}
            />
            Làm mới
          </button>
        </div>
      </div>

      <div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, index) => (
            <div
              key={index}
              className="bg-white border-2 border-black p-6 shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {card.title}
                </p>
                <div
                  className={`w-10 h-10 border-2 border-black ${card.color} flex items-center justify-center`}
                >
                  <i
                    className={`fa-solid ${card.icon} ${card.iconColor} text-sm`}
                  />
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold text-black tabular-nums">
                  {loading ? "..." : card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl font-bold uppercase tracking-tight bg-black text-white px-3 py-1">
              Thao tác nhanh
            </h2>
            <div className="h-0.5 flex-1 bg-black"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setRoute(action.route)}
                className="bg-white border-2 border-black p-6 text-left shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all group relative"
              >
                {/* Pending Badge */}
                {action.pendingCount > 0 && (
                  <div className="absolute top-4 right-4 bg-nung-red text-white text-[10px] px-2 py-0.5 font-bold uppercase tracking-widest border-2 border-black">
                    {action.pendingCount} Chờ
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 border-2 border-black ${action.iconBg} flex items-center justify-center flex-shrink-0 shadow-brutal-sm`}
                  >
                    <i
                      className={`fa-solid ${action.icon} text-xl text-white`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold uppercase tracking-tight mb-1 group-hover:text-nung-red transition-colors truncate">
                      {action.title}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 leading-snug">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white border-2 border-black shadow-brutal-sm overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-black bg-black text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-white bg-nung-red flex items-center justify-center">
                <i className="fa-solid fa-clock-rotate-left text-white text-lg" />
              </div>
              <div>
                <h2 className="text-lg font-bold uppercase tracking-tight">
                  Nhật ký hệ thống
                </h2>
              </div>
            </div>

            <button
              onClick={loadActivities}
              disabled={activitiesLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-black border-2 border-black font-bold uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <i
                className={`fa-solid fa-arrows-rotate ${
                  activitiesLoading ? "fa-spin" : ""
                }`}
              />
              Tải lại
            </button>
          </div>

          <div className="p-6">
            <div className="bg-white border-2 border-black">
              <RecentActivityList
                activities={activities}
                loading={activitiesLoading}
                setRoute={setRoute}
              />
            </div>
          </div>

          {activities.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t-2 border-black text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Hiển thị {activities.length} hoạt động gần nhất • Cập nhật:{" "}
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
