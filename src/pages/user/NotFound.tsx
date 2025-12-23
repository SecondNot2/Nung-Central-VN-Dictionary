import React from "react";
import { AppRoute } from "../../types";

interface NotFoundProps {
  setRoute: (route: AppRoute) => void;
}

const NotFound: React.FC<NotFoundProps> = ({ setRoute }) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-nung-dark">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 grayscale hover:grayscale-0 transition-all duration-1000"
        style={{ backgroundImage: "url('/404-background.png')" }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center md:justify-start p-6 md:p-24">
        {/* Brutalist Card */}
        <div className="max-w-md w-full bg-white border-8 border-black p-10 shadow-brutal transform -rotate-1">
          {/* 404 Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-nung-red text-white border-4 border-black mb-8 shadow-brutal-sm rotate-3">
            <span className="w-3 h-3 bg-white border-2 border-black animate-ping" />
            <span className="font-black uppercase tracking-widest text-sm">
              Mã lỗi 404
            </span>
          </div>

          {/* Message */}
          <div className="space-y-6 mb-10">
            <h1 className="text-5xl md:text-6xl font-display font-black text-nung-dark uppercase tracking-tighter leading-none">
              Lạc đường <br /> rồi bạn ơi!
            </h1>
            <p className="text-gray-600 font-serif font-bold text-lg leading-relaxed italic border-l-8 border-nung-blue pl-6">
              Trang bạn đang tìm kiếm không tồn tại hoặc đã bị "thất lạc" vào
              vùng dữ liệu khác rồi.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={() => setRoute(AppRoute.DICTIONARY)}
              className="flex-1 group flex items-center justify-center gap-3 px-6 py-4 bg-nung-red text-white border-4 border-black font-black uppercase tracking-widest text-sm shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <i className="fa-solid fa-house text-xl"></i>
              <span>Về Trang chủ</span>
            </button>

            <button
              onClick={() => window.history.back()}
              className="flex-1 group flex items-center justify-center gap-3 px-6 py-4 bg-white text-black border-4 border-black font-black uppercase tracking-widest text-sm shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <i className="fa-solid fa-arrow-left text-xl group-hover:-translate-x-2 transition-transform"></i>
              <span>Quay lại</span>
            </button>
          </div>

          {/* Helpful Links */}
          <div className="pt-8 border-t-4 border-black border-dotted">
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mb-4">
              Thử tìm ở các khu vực khác:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Tra từ điển", route: AppRoute.DICTIONARY },
                { label: "Chatbot AI", route: AppRoute.CHAT },
                { label: "Danh sách từ", route: AppRoute.DICTIONARY_LIST },
                { label: "Đóng góp", route: AppRoute.CONTRIBUTE },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={() => setRoute(link.route)}
                  className="px-3 py-1.5 bg-nung-sand/20 hover:bg-black hover:text-white border-2 border-black font-black uppercase tracking-widest text-[10px] transition-all"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
