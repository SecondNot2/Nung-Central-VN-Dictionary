# 📚 NungDic - Từ điển Văn hóa Nùng & Miền Trung

<div align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-Database-3FCF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS" />
</div>

<div align="center">
  <h3>🌾 Ứng dụng từ điển song ngữ Nùng - Việt với AI Translation</h3>
  <p>Bảo tồn và phát triển ngôn ngữ dân tộc Nùng thông qua công nghệ</p>
  <br/>
  <a href="https://nung-central-vn-dictionary.vercel.app/">🌐 Live Demo</a>
</div>

---

## ✨ Tính năng chính

### 🔤 Từ điển & Dịch thuật

- **Dịch song ngữ**: Hỗ trợ dịch Việt ↔ Nùng với AI (MegaLLM/Gemini API)
- **Engine dịch thuật thông minh**: Tự động ưu tiên khớp cụm từ dài nhất, ngăn chặn lặp từ và khớp sai chuỗi con
- **Suy luận từ vựng (Inference)**: Tự động suy luận nghĩa từ đơn từ các cụm từ có sẵn khi không tìm thấy kết quả trực tiếp
- **Từ điển chuẩn hóa (Enhanced Data)**: Dữ liệu được tái cấu trúc định kỳ để đảm bảo tính nhất quán (Chuẩn hóa phát âm/script, bóc tách loại từ, tích hợp ví dụ minh họa)
- **Tra cứu offline**: Từ điển có sẵn với hơn 1000+ từ vựng được hiệu chỉnh theo sắc thái Lạng Sơn
- **Phát âm**: Hỗ trợ text-to-speech cho cả hai ngôn ngữ
- **Lịch sử dịch**: Lưu trữ các bản dịch để tra cứu lại (đồng bộ cloud cho user đăng nhập)
- **Lưu bản dịch**: Bookmark bản dịch yêu thích để xem lại

### 💬 Cộng đồng & Tương tác

- **Thảo luận**: Bình luận, phản hồi (support 4 cấp độ nested replies) cho từng bản dịch
- **Thích/Like**: Tương tác với bình luận của người khác
- **Đề xuất chỉnh sửa**: Gửi đề xuất sửa bản dịch cho admin duyệt
- **Đóng góp từ vựng**: Người dùng có thể đề xuất từ mới
- **Báo cáo vi phạm**: Báo cáo bình luận không phù hợp

### 💡 Góp ý & Báo lỗi

- **Floating Feedback Button**: Nút góp ý luôn hiển thị góc phải màn hình
- **3 loại phản hồi**: Báo lỗi, Yêu cầu tính năng, Góp ý khác
- **Gửi ẩn danh**: Không cần đăng nhập cũng có thể góp ý

### 👥 Hệ thống người dùng

- **Xác thực**: Đăng nhập/đăng ký với Email hoặc Google OAuth
- **Hồ sơ cá nhân**: Quản lý thông tin, avatar với crop ảnh
- **Thư viện của tôi**: Xem bản dịch đã lưu, đề xuất, đóng góp

### 🛠️ Quản trị (Admin)

- **Dashboard**: Thống kê tổng quan hệ thống với pending counts
- **Quản lý từ điển**: Thêm, sửa, xóa từ vựng
- **Duyệt đóng góp**: Phê duyệt/từ chối đề xuất từ cộng đồng
- **Quản lý đề xuất chỉnh sửa**: Duyệt đề xuất sửa bản dịch
- **Quản lý báo cáo bình luận**: Xử lý bình luận vi phạm
- **Quản lý phản hồi**: Xem góp ý và báo lỗi từ người dùng
- **Quản lý người dùng**: Xem danh sách và phân quyền

### 🎨 Giao diện

- **Thiết kế hiện đại**: Glassmorphism, micro-animations
- **Responsive**: Tương thích mobile, tablet, desktop
- **Custom Design System**: Earth & Bamboo color palette

---

## 🚀 Cài đặt & Chạy

### Yêu cầu

- Node.js 18+
- npm hoặc yarn

### Cài đặt

```bash
# Clone repository
git clone https://github.com/SecondNot2/Nung-Central-VN-Dictionary.git
cd Nung-Central-VN-Dictionary

# Cài đặt dependencies
npm install
```

### Cấu hình môi trường

Tạo file `.env.local` với nội dung:

```env
# Supabase (bắt buộc cho authentication & database)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Translation API (chọn 1 trong 2)
VITE_MEGA_LLM_API_KEY=your_megallm_api_key
# hoặc
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Chạy ứng dụng

```bash
# Development mode
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

---

## 🏗️ Cấu trúc dự án

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components (Toast, Pagination, ConfirmDialog)
│   ├── layout/          # Navigation, Footer
│   ├── dictionary/      # Dictionary-related components
│   ├── discussion/      # Comment/Discussion components
│   ├── feedback/        # Feedback button & modal
│   └── contributions/   # Contribution components
├── pages/               # Main pages
│   ├── user/            # User-facing pages (Dictionary, Profile, MyLibrary)
│   ├── admin/           # Admin pages (Dashboard, Users, Suggestions, Reports)
│   └── auth/            # Login, Register
├── services/            # Business logic & API
│   ├── api/             # Supabase services (auth, saved, suggestions, reports)
│   ├── ai/              # AI translation (MegaLLM, Gemini)
│   ├── dictionary/      # Dictionary & vocab services
│   └── utils/           # Helper functions
├── types/               # TypeScript definitions
├── data/                # Static data (vocabulary)
└── App.tsx              # Main app component with routing
```

---

## 🔧 Công nghệ sử dụng

| Category | Technology                                   |
| -------- | -------------------------------------------- |
| Frontend | React 18, TypeScript, Vite 6                 |
| Styling  | TailwindCSS, Custom Design Tokens            |
| Backend  | Supabase (Auth, Database, Storage, RLS)      |
| AI       | MegaLLM API / Google Gemini API              |
| State    | React Hooks, LocalStorage, Supabase Realtime |
| Icons    | Font Awesome 6                               |
| Deploy   | Vercel                                       |

---

## 📊 Database Schema

### Main Tables

- `user_profiles` - Thông tin người dùng
- `contributions` - Đóng góp từ vựng
- `dictionary_entries` - Từ điển (admin quản lý)
- `approved_vocab` - Từ đã được duyệt
- `saved_translations` - Bản dịch đã lưu
- `translation_history` - Lịch sử dịch
- `translation_suggestions` - Đề xuất chỉnh sửa
- `discussions` - Bình luận/Thảo luận
- `discussion_likes` - Like bình luận
- `discussion_reports` - Báo cáo bình luận
- `feedback` - Góp ý & Báo lỗi

---

## 📝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

## 📄 License

Dự án được phát hành dưới giấy phép MIT. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## 👨‍💻 Tác giả

**Đường Quốc Thắng** - _Developer_

- GitHub: [@SecondNot2](https://github.com/SecondNot2)
- Email: duongquocthang190403@gmail.com

---

<div align="center">
  <p>🌟 Nếu dự án hữu ích, hãy cho tôi một Star! 🌟</p>
  <p>Made with ❤️ for preserving Nung language and culture</p>
</div>
