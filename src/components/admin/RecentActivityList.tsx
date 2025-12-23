import React from "react";
import {
  ActivityItem,
  ActivityType,
  ActivityAction,
  activityConfig,
  actionConfig,
  formatRelativeTime,
} from "../../services/api/activityService";
import { AppRoute } from "../../types";

interface RecentActivityListProps {
  activities: ActivityItem[];
  loading?: boolean;
  onActivityClick?: (activity: ActivityItem) => void;
  setRoute?: (route: AppRoute) => void;
}

const RecentActivityList: React.FC<RecentActivityListProps> = ({
  activities,
  loading = false,
  onActivityClick,
  setRoute,
}) => {
  const handleClick = (activity: ActivityItem) => {
    if (onActivityClick) {
      onActivityClick(activity);
    } else if (setRoute && activity.route) {
      setRoute(activity.route);
    }
  };

  // Get icon based on activity type
  const getActivityIcon = (type: ActivityType): string => {
    return activityConfig[type]?.icon || "fa-circle";
  };

  // Get colors based on action
  const getActionColors = (action: ActivityAction) => {
    return (
      actionConfig[action] || {
        color: "text-black",
        bgColor: "bg-gray-200",
        label: action,
      }
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-start gap-6 p-4 border-b-4 border-black animate-pulse"
          >
            <div className="w-14 h-14 bg-gray-200 border-4 border-black shadow-brutal-sm" />
            <div className="flex-1">
              <div className="h-6 bg-gray-200 border-2 border-black w-2/3 mb-3" />
              <div className="h-4 bg-gray-100 border-2 border-black w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (activities.length === 0) {
    return (
      <div className="text-center py-16 bg-nung-sand/5">
        <div className="w-20 h-20 border-4 border-black bg-white flex items-center justify-center mx-auto mb-6 shadow-brutal rotate-3">
          <i className="fa-solid fa-clock-rotate-left text-3xl text-gray-300" />
        </div>
        <p className="text-xl font-display font-black uppercase tracking-tighter text-nung-dark mb-2">
          Chưa có hoạt động
        </p>
        <p className="text-sm font-serif font-bold italic text-gray-400">
          Các nhật ký hệ thống sẽ tự động xuất hiện tại đây
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y-4 divide-black border-4 border-black">
      {activities.map((activity, index) => {
        const { color: actionColor, bgColor: actionBg } = getActionColors(
          activity.action
        );
        const icon = getActivityIcon(activity.type);

        return (
          <button
            key={activity.id}
            onClick={() => handleClick(activity)}
            className={`w-full text-left p-6 hover:bg-nung-sand/10 transition-all group cursor-pointer relative overflow-hidden`}
          >
            <div className="flex items-start gap-6 relative z-10">
              {/* Icon Container */}
              <div
                className={`w-14 h-14 border-4 border-black ${actionBg} flex items-center justify-center flex-shrink-0 shadow-brutal-sm group-hover:rotate-6 transition-transform`}
              >
                <i className={`fa-solid ${icon} ${actionColor} text-xl`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h4 className="text-lg font-display font-black uppercase tracking-tighter text-nung-dark group-hover:text-nung-red transition-colors">
                    {activity.title}
                  </h4>
                  <span
                    className={`text-[10px] px-2 py-0.5 border-2 border-black ${actionBg} ${actionColor} font-black uppercase tracking-widest`}
                  >
                    {actionConfig[activity.action]?.label}
                  </span>
                </div>

                <p className="text-sm font-serif font-bold text-gray-600 mb-2 leading-relaxed">
                  {activity.description}
                </p>

                <div className="flex items-center gap-4">
                  {activity.user_name && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <i className="fa-solid fa-user-ninja text-nung-blue" />
                      <span>{activity.user_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <i className="fa-solid fa-clock text-gray-300" />
                    <span>{formatRelativeTime(activity.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Action Indicator */}
              <div className="flex-shrink-0 self-center">
                <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center shadow-brutal-sm group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
                  <i className="fa-solid fa-chevron-right text-black" />
                </div>
              </div>
            </div>

            {/* Subtle hover background decoration */}
            <div className="absolute top-0 right-0 w-24 h-full bg-nung-red/5 skew-x-[-20deg] translate-x-32 group-hover:translate-x-16 transition-transform duration-500"></div>
          </button>
        );
      })}
    </div>
  );
};

export default RecentActivityList;
