# 📚 NungDic - Từ điển Văn hóa Nùng & Miền Trung

<div align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-Database-3FCF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS" />
</div>

<div align="center">
  <h3>🌾 Ứng dụng từ điển song ngữ Nùng - Việt với AI Translation</h3>
  <p>Bảo tồn và phát triển ngôn ngữ dân tộc Nùng thông qua công nghệ</p>
</div>

---

## ✨ Tính năng chính

### 🔤 Từ điển & Dịch thuật

- **Dịch song ngữ**: Hỗ trợ dịch Việt ↔ Nùng với AI (MegaLLM/Gemini API)
- **Tra cứu offline**: Từ điển có sẵn với hơn 1000+ từ vựng
- **Phát âm**: Hỗ trợ text-to-speech cho cả hai ngôn ngữ
- **Lịch sử dịch**: Lưu trữ các bản dịch để tra cứu lại

### 👥 Hệ thống người dùng

- **Xác thực**: Đăng nhập/đăng ký với Email hoặc Google OAuth
- **Hồ sơ cá nhân**: Quản lý thông tin, avatar với crop ảnh
- **Đóng góp từ vựng**: Người dùng có thể đề xuất từ mới

### 🛠️ Quản trị (Admin)

- **Dashboard**: Thống kê tổng quan hệ thống
- **Quản lý từ điển**: Thêm, sửa, xóa từ vựng
- **Duyệt đóng góp**: Phê duyệt/từ chối đề xuất từ cộng đồng
- **Quản lý người dùng**: Xem danh sách và phân quyền

### 🎨 Giao diện

- **Thiết kế hiện đại**: Glassmorphism, micro-animations
- **Responsive**: Tương thích mobile, tablet, desktop
- **Dark/Light mode**: Hỗ trợ chế độ sáng/tối

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
├── components/        # Reusable UI components
│   ├── ImageCropper   # Crop ảnh avatar
│   ├── Navigation     # Header navigation
│   ├── ToastContainer # Thông báo
│   └── ...
├── pages/             # Main pages
│   ├── Dictionary     # Trang dịch thuật chính
│   ├── Contribute     # Đóng góp từ vựng
│   ├── UserProfile    # Hồ sơ cá nhân
│   ├── AdminDashboard # Dashboard quản trị
│   └── ...
├── services/          # Business logic & API
│   ├── authService    # Xác thực
│   ├── megaLlmService # AI translation
│   ├── nungVocab      # Từ điển offline
│   └── ...
├── types.ts           # TypeScript definitions
└── App.tsx            # Main app component
```

---

## 🔧 Công nghệ sử dụng

| Category | Technology                         |
| -------- | ---------------------------------- |
| Frontend | React 18, TypeScript, Vite         |
| Styling  | TailwindCSS, Custom Design Tokens  |
| Backend  | Supabase (Auth, Database, Storage) |
| AI       | MegaLLM API / Google Gemini API    |
| State    | React Hooks, LocalStorage          |
| Icons    | Font Awesome 6                     |

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
  <p>🌟 Nếu dự án hữu ích, hãy cho chúng tôi một Star! 🌟</p>
  <p>Made with ❤️ for preserving Nung language and culture</p>
</div>
