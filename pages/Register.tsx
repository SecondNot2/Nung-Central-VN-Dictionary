import React, { useState, useMemo } from "react";
import { ToastContainer, useToast } from "../components";
import { AppRoute } from "../types";
import { signUp } from "../services/authService";

interface RegisterProps {
  setRoute: (route: AppRoute) => void;
  onLogin: (user: {
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
  }) => void;
}

const Register: React.FC<RegisterProps> = ({ setRoute, onLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const { password } = formData;
    if (!password) return { score: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    const levels = [
      { score: 0, label: "", color: "" },
      { score: 1, label: "Rất yếu", color: "bg-red-500" },
      { score: 2, label: "Yếu", color: "bg-orange-500" },
      { score: 3, label: "Trung bình", color: "bg-yellow-500" },
      { score: 4, label: "Mạnh", color: "bg-bamboo-500" },
      { score: 5, label: "Rất mạnh", color: "bg-bamboo-600" },
    ];

    return levels[Math.min(score, 5)];
  }, [formData.password]);

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Họ tên phải có ít nhất 2 ký tự";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Bạn phải đồng ý với điều khoản sử dụng";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await signUp(
        formData.email,
        formData.password,
        formData.name
      );

      if (result.success && result.user) {
        // Auto login after successful registration (skip email verification)
        const user = {
          id: result.user.id,
          email: result.user.email || formData.email,
          name: result.profile?.display_name || formData.name,
          role: (result.profile?.role === "admin" ? "admin" : "user") as
            | "user"
            | "admin",
        };

        addToast("Đăng ký thành công! Đang đăng nhập...", "success");

        setTimeout(() => {
          onLogin(user);
          setRoute(AppRoute.DICTIONARY);
        }, 1000);
      } else {
        addToast(result.error || "Đăng ký thất bại", "error");
      }
    } catch (err) {
      addToast("Lỗi kết nối. Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bamboo-50 via-earth-50 to-earth-100 px-4 py-12">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Back to Home Button */}
      <button
        onClick={() => setRoute(AppRoute.DICTIONARY)}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-earth-200/50 text-earth-700 hover:bg-white hover:text-bamboo-600 hover:border-bamboo-300 transition-all shadow-sm hover:shadow-md group z-10"
      >
        <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Trang chủ</span>
      </button>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-20 w-80 h-80 bg-bamboo-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-20 w-64 h-64 bg-earth-200/40 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo & Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-earth-600 to-earth-800 rounded-2xl shadow-lg mb-4 transform hover:scale-105 transition-transform">
            <i className="fa-solid fa-user-plus text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-earth-900 mb-2">
            Tạo tài khoản mới
          </h1>
          <p className="text-earth-600">Tham gia cộng đồng bảo tồn ngôn ngữ</p>
        </div>

        {/* Register Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-earth-200/50 p-8 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-earth-700 mb-2"
              >
                <i className="fa-solid fa-user mr-2 text-earth-400" />
                Họ và tên
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.name
                    ? "border-red-400 focus:ring-red-500"
                    : "border-earth-300 focus:ring-bamboo-500"
                } focus:ring-2 focus:border-transparent outline-none transition-all bg-white text-earth-900 placeholder-earth-400`}
                placeholder="Nguyễn Văn A"
                autoComplete="name"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-500 flex items-center">
                  <i className="fa-solid fa-circle-exclamation mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-earth-700 mb-2"
              >
                <i className="fa-solid fa-envelope mr-2 text-earth-400" />
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.email
                    ? "border-red-400 focus:ring-red-500"
                    : "border-earth-300 focus:ring-bamboo-500"
                } focus:ring-2 focus:border-transparent outline-none transition-all bg-white text-earth-900 placeholder-earth-400`}
                placeholder="email@example.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-500 flex items-center">
                  <i className="fa-solid fa-circle-exclamation mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-earth-700 mb-2"
              >
                <i className="fa-solid fa-lock mr-2 text-earth-400" />
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                    errors.password
                      ? "border-red-400 focus:ring-red-500"
                      : "border-earth-300 focus:ring-bamboo-500"
                  } focus:ring-2 focus:border-transparent outline-none transition-all bg-white text-earth-900 placeholder-earth-400`}
                  placeholder="Tối thiểu 8 ký tự"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600 transition-colors"
                >
                  <i
                    className={`fa-solid ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  />
                </button>
              </div>
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          passwordStrength.score >= level
                            ? passwordStrength.color
                            : "bg-earth-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs ${
                      passwordStrength.score >= 4
                        ? "text-bamboo-600"
                        : passwordStrength.score >= 3
                        ? "text-yellow-600"
                        : "text-red-500"
                    }`}
                  >
                    Độ mạnh: {passwordStrength.label}
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="mt-2 text-sm text-red-500 flex items-center">
                  <i className="fa-solid fa-circle-exclamation mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-earth-700 mb-2"
              >
                <i className="fa-solid fa-lock mr-2 text-earth-400" />
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    updateField("confirmPassword", e.target.value)
                  }
                  className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                    errors.confirmPassword
                      ? "border-red-400 focus:ring-red-500"
                      : formData.confirmPassword &&
                        formData.password === formData.confirmPassword
                      ? "border-bamboo-400 focus:ring-bamboo-500"
                      : "border-earth-300 focus:ring-bamboo-500"
                  } focus:ring-2 focus:border-transparent outline-none transition-all bg-white text-earth-900 placeholder-earth-400`}
                  placeholder="Nhập lại mật khẩu"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600 transition-colors"
                >
                  <i
                    className={`fa-solid ${
                      showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  />
                </button>
                {formData.confirmPassword &&
                  formData.password === formData.confirmPassword && (
                    <span className="absolute right-12 top-1/2 -translate-y-1/2 text-bamboo-500">
                      <i className="fa-solid fa-check" />
                    </span>
                  )}
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-500 flex items-center">
                  <i className="fa-solid fa-circle-exclamation mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div>
              <label className="flex items-start cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => updateField("acceptTerms", e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-earth-300 text-bamboo-600 focus:ring-bamboo-500 cursor-pointer"
                />
                <span className="ml-2 text-sm text-earth-600 group-hover:text-earth-800 transition-colors">
                  Tôi đồng ý với{" "}
                  <a
                    href="#"
                    className="text-bamboo-600 hover:underline font-medium"
                    onClick={(e) => e.preventDefault()}
                  >
                    Điều khoản sử dụng
                  </a>{" "}
                  và{" "}
                  <a
                    href="#"
                    className="text-bamboo-600 hover:underline font-medium"
                    onClick={(e) => e.preventDefault()}
                  >
                    Chính sách bảo mật
                  </a>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-2 text-sm text-red-500 flex items-center">
                  <i className="fa-solid fa-circle-exclamation mr-1" />
                  {errors.acceptTerms}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center ${
                loading
                  ? "bg-earth-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-earth-700 to-earth-800 hover:from-earth-800 hover:to-earth-900 hover:shadow-xl active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin mr-2" />
                  Đang tạo tài khoản...
                </>
              ) : (
                <>
                  Đăng ký
                  <i className="fa-solid fa-arrow-right ml-2" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <p className="text-center mt-8 text-earth-600 animate-fade-in">
          Đã có tài khoản?{" "}
          <button
            onClick={() => setRoute(AppRoute.LOGIN)}
            className="text-bamboo-600 hover:text-bamboo-700 font-semibold transition-colors"
          >
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
