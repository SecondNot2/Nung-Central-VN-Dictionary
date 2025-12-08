import React, { useState } from "react";
import { AppRoute, User } from "../../types";

interface NavigationProps {
  currentRoute: AppRoute;
  setRoute: (route: AppRoute) => void;
  user?: User | null;
  onLogout?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentRoute,
  setRoute,
  user,
  onLogout,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Main navigation items (visible to all)
  const mainNavItems = [
    { id: AppRoute.DICTIONARY, label: "Dịch", icon: "fa-language" },
    { id: AppRoute.DICTIONARY_LIST, label: "Tra cứu", icon: "fa-book-open" },
    { id: AppRoute.IMAGE_ANALYSIS, label: "Phân tích ảnh", icon: "fa-camera" },
    { id: AppRoute.CHAT, label: "Trò chuyện AI", icon: "fa-comments" },
    {
      id: AppRoute.CONTRIBUTE,
      label: "Đóng góp",
      icon: "fa-hand-holding-heart",
    },
  ];

  // Admin-only items
  const adminNavItems = [
    { id: AppRoute.ADMIN_DASHBOARD, label: "Quản lý", icon: "fa-gauge-high" },
  ];

  const isAdmin = user?.role === "admin";

  // Combined nav items based on user role
  const getVisibleNavItems = () => {
    let items = [...mainNavItems];
    if (isAdmin) {
      items = [...items, ...adminNavItems];
    }
    return items;
  };

  const visibleNavItems = getVisibleNavItems();

  return (
    <nav className="sticky top-0 z-50 bg-earth-900 text-earth-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setRoute(AppRoute.DICTIONARY)}
          >
            <div className="bg-bamboo-600 p-2 rounded-full">
              <i className="fa-solid fa-language text-white" />
            </div>
            <span className="font-serif font-bold text-xl tracking-wide">
              NungDic
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {visibleNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setRoute(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  currentRoute === item.id
                    ? "bg-earth-700 text-white"
                    : "text-earth-200 hover:bg-earth-800 hover:text-white"
                }`}
              >
                <i className={`fa-solid ${item.icon} mr-2`} />
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Side: Auth */}
          <div className="flex items-center space-x-3">
            {user ? (
              /* User Menu */
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-earth-800 transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-bamboo-600 rounded-full flex items-center justify-center text-white font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium">
                    {user.name}
                  </span>
                  <i
                    className={`fa-solid fa-chevron-down text-xs transition-transform ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-earth-200 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-earth-100">
                        <p className="text-sm font-medium text-earth-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-earth-500">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-bamboo-100 text-bamboo-700 text-xs font-medium rounded-full">
                            Quản trị viên
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setRoute(AppRoute.MY_LIBRARY);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-earth-700 hover:bg-earth-50 transition-colors flex items-center"
                      >
                        <i className="fa-solid fa-folder-open mr-2" />
                        Thư viện của tôi
                      </button>
                      <button
                        onClick={() => {
                          setRoute(AppRoute.PROFILE);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-earth-700 hover:bg-earth-50 transition-colors flex items-center"
                      >
                        <i className="fa-solid fa-user mr-2" />
                        Hồ sơ cá nhân
                      </button>
                      <button
                        onClick={() => {
                          onLogout?.();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                      >
                        <i className="fa-solid fa-right-from-bracket mr-2" />
                        Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Login/Register Buttons */
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setRoute(AppRoute.LOGIN)}
                  className="px-4 py-2 text-sm font-medium text-earth-200 hover:text-white transition-colors"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => setRoute(AppRoute.REGISTER)}
                  className="px-4 py-2 text-sm font-medium bg-bamboo-600 text-white rounded-lg hover:bg-bamboo-700 transition-colors"
                >
                  Đăng ký
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-earth-800 transition-colors"
            >
              <i
                className={`fa-solid ${
                  isMobileMenuOpen ? "fa-xmark" : "fa-bars"
                } text-lg`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-earth-800 py-3 animate-fade-in">
            <div className="space-y-1">
              {visibleNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setRoute(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    currentRoute === item.id
                      ? "bg-earth-700 text-white"
                      : "text-earth-200 hover:bg-earth-800"
                  }`}
                >
                  <i className={`fa-solid ${item.icon} mr-3 w-5 text-center`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
