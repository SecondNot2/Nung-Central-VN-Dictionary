import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Dịch", hash: "#dictionary" },
    { label: "Chatbot", hash: "#chat" },
    { label: "Đóng góp", hash: "#contribute" },
    { label: "Tra cứu từ điển", hash: "#dictionary_list" },
  ];

  return (
    <footer className="bg-gradient-to-b from-earth-800 to-earth-900 text-earth-300">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-green-600 via-green-500 to-green-600" />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Project Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {/* Book icon */}
              <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  <path d="M8 7h8" />
                  <path d="M8 11h6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">
                Từ điển Nùng & MTVN
              </h3>
            </div>
            <p className="text-earth-400 text-sm leading-relaxed">
              Dự án bảo tồn và phát triển ngôn ngữ Nùng cùng các ngôn ngữ miền
              Trung Việt Nam. Gìn giữ di sản văn hóa và truyền thống cho thế hệ
              tương lai.
            </p>
            <div className="flex items-center gap-2 text-green-500 text-sm">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <span>Gìn giữ Ngôn ngữ & Văn hóa</span>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Điều hướng</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.hash}>
                  <a
                    href={link.hash}
                    className="group flex items-center gap-2 text-earth-400 hover:text-green-400 transition-colors duration-200 cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Kết nối</h3>
            <div className="space-y-3">
              {/* GitHub */}
              <a
                href="https://github.com/SecondNot2/Nung-Central-VN-Dictionary"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-3 rounded-xl bg-earth-700/30 hover:bg-earth-700/50 border border-earth-700/50 hover:border-green-500/30 transition-all duration-300 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm group-hover:text-green-400 transition-colors">
                    GitHub
                  </p>
                  <p className="text-earth-500 text-xs">Xem mã nguồn dự án</p>
                </div>
                <svg
                  className="w-4 h-4 text-earth-500 group-hover:text-green-400 group-hover:translate-x-1 transition-all duration-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </a>

              {/* Email */}
              <a
                href="mailto:duongquocthang190403@gmail.com"
                className="group flex items-center gap-3 p-3 rounded-xl bg-earth-700/30 hover:bg-earth-700/50 border border-earth-700/50 hover:border-green-500/30 transition-all duration-300 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm group-hover:text-green-400 transition-colors">
                    Email
                  </p>
                  <p className="text-earth-500 text-xs">Liên hệ hỗ trợ</p>
                </div>
                <svg
                  className="w-4 h-4 text-earth-500 group-hover:text-green-400 group-hover:translate-x-1 transition-all duration-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-8 border-t border-earth-700/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-earth-400">
            <p>
              © {currentYear} Dự án Từ điển Nùng & Miền Trung Việt Nam. Bảo lưu
              mọi quyền.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>
                Được phát triển bởi Quốc Thắng theo mô hình dự án cá nhân
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
