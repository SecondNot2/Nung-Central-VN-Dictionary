import React from "react";
import { AppRoute } from "../types";

interface NotFoundProps {
  setRoute: (route: AppRoute) => void;
}

const NotFound: React.FC<NotFoundProps> = ({ setRoute }) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/404-background.png')" }}
      />

      {/* Overlay - stronger on mobile for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-earth-900/90 via-earth-900/40 to-earth-900/20 md:bg-none" />

      {/* Desktop only: subtle overlay on the left for card visibility */}
      <div className="hidden md:block absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-earth-900/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-end md:items-center justify-center md:justify-start p-6 pb-10 md:p-12">
        {/* Card - transparent on mobile, glassmorphism on desktop */}
        <div className="max-w-sm w-full md:bg-earth-900/40 md:backdrop-blur-md rounded-2xl md:border md:border-earth-700/30 p-0 md:p-8 md:shadow-2xl">
          {/* 404 Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/30 border border-amber-500/40 mb-4 md:mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-300 text-sm font-semibold">
              Lỗi 404
            </span>
          </div>

          {/* Message */}
          <div className="space-y-3 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              Lạc đường rồi!
            </h1>
            <p className="text-white/90 md:text-earth-300 text-sm leading-relaxed drop-shadow-md md:drop-shadow-none">
              Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển đến
              địa chỉ khác.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={() => setRoute(AppRoute.DICTIONARY)}
              className="group flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium shadow-lg shadow-green-900/30 transition-all duration-300 cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Về Trang chủ</span>
            </button>

            <button
              onClick={() => window.history.back()}
              className="group flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 md:bg-white/10 md:hover:bg-white/20 backdrop-blur-sm text-white font-medium border border-white/30 md:border-white/20 transition-all duration-300 cursor-pointer"
            >
              <svg
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Quay lại</span>
            </button>
          </div>

          {/* Helpful Links */}
          <div className="pt-5 border-t border-white/20 md:border-white/10">
            <p className="text-white/70 md:text-earth-400 text-xs mb-3">
              Có thể bạn muốn tìm:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setRoute(AppRoute.DICTIONARY)}
                className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 md:bg-white/5 md:hover:bg-white/15 text-white md:text-earth-300 md:hover:text-white text-xs transition-all duration-200 cursor-pointer border border-white/20 md:border-white/10"
              >
                Tra từ điển
              </button>
              <button
                onClick={() => setRoute(AppRoute.CHAT)}
                className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 md:bg-white/5 md:hover:bg-white/15 text-white md:text-earth-300 md:hover:text-white text-xs transition-all duration-200 cursor-pointer border border-white/20 md:border-white/10"
              >
                Chatbot
              </button>
              <button
                onClick={() => setRoute(AppRoute.DICTIONARY_LIST)}
                className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 md:bg-white/5 md:hover:bg-white/15 text-white md:text-earth-300 md:hover:text-white text-xs transition-all duration-200 cursor-pointer border border-white/20 md:border-white/10"
              >
                Danh sách từ
              </button>
              <button
                onClick={() => setRoute(AppRoute.CONTRIBUTE)}
                className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 md:bg-white/5 md:hover:bg-white/15 text-white md:text-earth-300 md:hover:text-white text-xs transition-all duration-200 cursor-pointer border border-white/20 md:border-white/10"
              >
                Đóng góp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
