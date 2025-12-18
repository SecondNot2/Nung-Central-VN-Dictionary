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
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        label: action,
      }
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-earth-200" />
            <div className="flex-1">
              <div className="h-4 bg-earth-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-earth-100 rounded w-1/2" />
            </div>
            <div className="h-3 bg-earth-100 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-earth-100 flex items-center justify-center mx-auto mb-4">
          <i className="fa-solid fa-clock-rotate-left text-2xl text-earth-400" />
        </div>
        <p className="text-earth-500 font-medium">Chưa có hoạt động nào</p>
        <p className="text-earth-400 text-sm mt-1">
          Các hoạt động gần đây sẽ hiển thị ở đây
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, index) => {
        const { color, bgColor } = getActionColors(activity.action);
        const icon = getActivityIcon(activity.type);

        return (
          <button
            key={activity.id}
            onClick={() => handleClick(activity)}
            className={`w-full text-left p-4 rounded-xl hover:bg-earth-50 transition-all group cursor-pointer ${
              index !== activities.length - 1 ? "border-b border-earth-100" : ""
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
              >
                <i className={`fa-solid ${icon} ${color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-earth-900 text-sm">
                    {activity.title}
                  </h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${bgColor} ${color} font-medium`}
                  >
                    {actionConfig[activity.action]?.label}
                  </span>
                </div>
                <p className="text-sm text-earth-600 mt-0.5 truncate">
                  {activity.description}
                </p>
                {activity.user_name && (
                  <p className="text-xs text-earth-400 mt-1 flex items-center gap-1">
                    <i className="fa-solid fa-user text-[10px]" />
                    {activity.user_name}
                  </p>
                )}
              </div>

              {/* Time */}
              <div className="flex-shrink-0 text-right">
                <span className="text-xs text-earth-400">
                  {formatRelativeTime(activity.created_at)}
                </span>
                <i className="fa-solid fa-chevron-right text-earth-300 group-hover:text-bamboo-500 group-hover:translate-x-1 transition-all ml-2 text-xs" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default RecentActivityList;
