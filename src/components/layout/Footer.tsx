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
    <footer className="bg-black text-white pt-20 pb-10 border-t-4 border-white relative overflow-hidden">
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-fabric"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center">
              <div className="bg-nung-red p-3 border-2 border-white shadow-[4px_4px_0px_0px_#fff]">
                <i className="fa-solid fa-compass text-2xl text-white" />
              </div>
              <span className="ml-4 font-display font-bold text-4xl tracking-tight">
                NungDic
              </span>
            </div>
            <p className="text-gray-400 max-w-md text-lg leading-relaxed font-serif">
              Dự án được tạo ra với tình yêu dành cho việc bảo tồn và phát huy
              ngôn ngữ cùng văn hóa Nùng. Hãy cùng chúng tôi gìn giữ di sản quý
              giá này.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-nung-green text-white px-4 py-2 border-2 border-white shadow-brutal-sm font-bold text-xs uppercase">
                Gìn giữ bản sắc
              </div>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="font-serif font-bold text-xl mb-8 relative inline-block">
              <span className="relative z-10">Điều hướng</span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-nung-red -z-0 transform -rotate-1"></span>
            </h4>
            <ul className="space-y-4 text-gray-400 font-bold">
              {quickLinks.map((link) => (
                <li key={link.hash}>
                  <a
                    href={link.hash}
                    className="hover:text-nung-red transition-colors flex items-center group"
                  >
                    <i className="fa-solid fa-chevron-right text-[10px] mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Section */}
          <div>
            <h4 className="font-serif font-bold text-xl mb-8 relative inline-block">
              <span className="relative z-10">Kết nối</span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-nung-blue -z-0 transform rotate-1"></span>
            </h4>
            <div className="space-y-4">
              <a
                href="https://github.com/SecondNot2/Nung-Central-VN-Dictionary"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-3 border-2 border-white hover:bg-white hover:text-black transition-all group shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                <i className="fa-brands fa-github text-2xl" />
                <span className="font-bold text-sm">GitHub Source</span>
              </a>

              <a
                href="mailto:duongquocthang190403@gmail.com"
                className="flex items-center gap-4 p-3 border-2 border-white hover:bg-nung-green transition-all group shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                <i className="fa-solid fa-envelope text-2xl" />
                <span className="font-bold text-sm">Email Support</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t-2 border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 font-bold uppercase tracking-widest gap-6">
          <p>© {currentYear} NungDic Project. All Cultural Rights Reserved.</p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 border-2 border-black shadow-brutal-sm font-black text-[10px]">
              <i className="fa-solid fa-heart text-nung-red animate-pulse" />
              Build by Quoc Thang
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
