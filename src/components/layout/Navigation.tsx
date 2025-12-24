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

  // Main navigation items (core app features)
  const coreNavItems = [
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

  const landingPageLink = {
    label: "Trang chủ",
    icon: "fa-house",
    url: "https://nungdic.vercel.app",
  };

  const isAdmin = user?.role === "admin";

  return (
    <nav className="sticky top-0 z-50 bg-nung-sand border-b-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Home Link */}
          <div className="flex items-center space-x-4">
            <div
              className="flex items-center cursor-pointer group"
              onClick={() => setRoute(AppRoute.DICTIONARY)}
            >
              <div className="flex items-center bg-nung-red text-white border-2 border-black p-2 shadow-brutal transform group-hover:-translate-y-1 transition-transform">
                <i className="fa-solid fa-compass text-2xl mr-2" />
                <span className="font-display text-2xl tracking-tight">
                  NungDic
                </span>
              </div>
            </div>

            {/* Desktop Home Icon Link */}
            <div className="hidden lg:block h-8 w-px bg-black opacity-20 mx-2"></div>
            <button
              onClick={() => window.open(landingPageLink.url, "_blank")}
              className="hidden lg:flex items-center justify-center w-10 h-10 border-2 border-black bg-white shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              title="Về Trang chủ"
            >
              <i className={`fa-solid ${landingPageLink.icon} text-lg`} />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2 font-serif font-bold text-sm">
            {coreNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setRoute(item.id)}
                className={`px-4 py-2 border-2 transition-all duration-200 ${
                  currentRoute === item.id
                    ? "bg-nung-blue text-white border-black shadow-brutal-sm"
                    : "border-transparent hover:border-black hover:bg-white text-nung-dark"
                }`}
              >
                <i className={`fa-solid ${item.icon} mr-2`} />
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Side: Auth */}
          <div className="flex items-center space-x-4">
            {user ? (
              /* User Menu */
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 border-2 border-black bg-white shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-none border-2 border-black object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-nung-green border-2 border-black flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-bold uppercase">
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
                    <div className="absolute right-0 mt-3 w-64 bg-white border-4 border-black shadow-brutal-lg py-2 z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b-2 border-black bg-nung-sand/30">
                        <p className="text-sm font-bold text-nung-dark uppercase">
                          {user.name}
                        </p>
                        <p className="text-xs font-medium text-gray-600 truncate">
                          {user.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-nung-red text-white text-[10px] font-bold uppercase border-1 border-black">
                            ADMIN
                          </span>
                        )}
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setRoute(AppRoute.ADMIN_DASHBOARD);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm font-bold bg-nung-red/10 hover:bg-nung-red hover:text-white transition-colors flex items-center border-b-2 border-black"
                        >
                          <i className="fa-solid fa-gauge-high mr-3" />
                          Quản trị hệ thống
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setRoute(AppRoute.MY_LIBRARY);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-nung-blue hover:text-white transition-colors flex items-center border-b-2 border-transparent hover:border-black"
                      >
                        <i className="fa-solid fa-folder-open mr-3" />
                        Thư viện của tôi
                      </button>
                      <button
                        onClick={() => {
                          setRoute(AppRoute.PROFILE);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-nung-blue hover:text-white transition-colors flex items-center border-b-2 border-transparent hover:border-black"
                      >
                        <i className="fa-solid fa-user mr-3" />
                        Hồ sơ cá nhân
                      </button>
                      <button
                        onClick={() => {
                          onLogout?.();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-nung-red hover:bg-nung-red hover:text-white transition-colors flex items-center"
                      >
                        <i className="fa-solid fa-right-from-bracket mr-3" />
                        Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Login/Register Buttons */
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setRoute(AppRoute.LOGIN)}
                  className="hidden sm:block px-4 py-2 text-sm font-bold border-2 border-transparent hover:border-black transition-all"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => setRoute(AppRoute.REGISTER)}
                  className="px-6 py-2 text-sm font-bold bg-nung-red text-white border-2 border-black shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  Đăng ký
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 border-2 border-black bg-white hover:bg-nung-sand transition-colors"
            >
              <i
                className={`fa-solid ${
                  isMobileMenuOpen ? "fa-xmark" : "fa-bars"
                } text-xl`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Overlay Style */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-[2px]"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="lg:hidden absolute top-full left-0 right-0 border-b-4 border-black py-4 bg-nung-sand z-50 animate-fade-in shadow-brutal-lg max-h-[calc(100vh-5rem)] overflow-y-auto w-full">
            <div className="max-w-7xl mx-auto px-4">
              <div className="space-y-3">
                {/* Core Features Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {coreNavItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setRoute(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`h-24 flex flex-col items-center justify-center p-2 border-2 transition-all font-serif font-bold shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${
                        currentRoute === item.id
                          ? "bg-nung-blue text-white border-black"
                          : "bg-white text-nung-dark border-black"
                      }`}
                    >
                      <i className={`fa-solid ${item.icon} mb-2 text-xl`} />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* System & External Links List */}
                <div className="space-y-3 pt-4 border-t-2 border-black/10">
                  <button
                    onClick={() => {
                      window.open(landingPageLink.url, "_blank");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-4 border-2 border-black bg-white text-nung-dark transition-all font-bold flex items-center shadow-brutal-sm"
                  >
                    <i
                      className={`fa-solid ${landingPageLink.icon} mr-4 w-6 text-center text-lg`}
                    />
                    <span className="text-lg">{landingPageLink.label}</span>
                    <i className="fa-solid fa-arrow-up-right-from-square ml-auto text-xs opacity-40" />
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setRoute(AppRoute.ADMIN_DASHBOARD);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-5 py-4 border-2 border-black bg-nung-red text-white transition-all font-bold flex items-center shadow-brutal-sm"
                    >
                      <i className="fa-solid fa-gauge-high mr-4 w-6 text-center text-lg" />
                      <span className="text-lg">Quản lý hệ thống</span>
                    </button>
                  )}
                </div>
                {!user && (
                  <div className="pt-4 mt-6 border-t-4 border-black flex flex-col space-y-3">
                    <button
                      onClick={() => {
                        setRoute(AppRoute.LOGIN);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-4 font-bold border-2 border-black bg-white shadow-brutal-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-lg"
                    >
                      Đăng nhập
                    </button>
                    <button
                      onClick={() => {
                        setRoute(AppRoute.REGISTER);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-4 font-bold border-2 border-black bg-nung-red text-white shadow-brutal-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-lg"
                    >
                      Đăng ký tài khoản
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navigation;
