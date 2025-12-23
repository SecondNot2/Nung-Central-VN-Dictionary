import React, { useState, useMemo } from "react";
import { ToastContainer, useToast } from "../../components";
import { AppRoute } from "../../types";
import { signUp } from "../../services/api/authService";

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
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12 relative overflow-hidden">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Back to Home Button */}
      <button
        onClick={() => setRoute(AppRoute.DICTIONARY)}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white border-2 border-black text-black font-bold uppercase text-[10px] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all z-10"
      >
        <i className="fa-solid fa-arrow-left" />
        Trang chủ
      </button>

      {/* Decorative patterns (Lite) */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-nung-blue/5 rotate-12 -translate-x-20 -translate-y-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-nung-red/5 -rotate-12 translate-x-20 translate-y-20 pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white border-2 border-black mb-4 shadow-brutal-sm">
            <i className="fa-solid fa-user-plus text-2xl" />
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-black mb-1">
            Đăng ký
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
            Tham gia cộng đồng NungDic
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white border-2 border-black shadow-brutal p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2"
              >
                <i className="fa-solid fa-user mr-2" />
                Họ và tên
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={`w-full px-4 py-3 border-2 border-black font-bold focus:bg-gray-50 outline-none transition-all ${
                  errors.name ? "border-nung-red" : "border-black"
                }`}
                placeholder="Nguyễn Văn A"
                autoComplete="name"
              />
              {errors.name && (
                <p className="mt-2 text-[10px] font-bold text-nung-red uppercase tracking-wider flex items-center">
                  <i className="fa-solid fa-circle-exclamation mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2"
              >
                <i className="fa-solid fa-envelope mr-2" />
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={`w-full px-4 py-3 border-2 border-black font-bold focus:bg-gray-50 outline-none transition-all ${
                  errors.email ? "border-nung-red" : "border-black"
                }`}
                placeholder="email@example.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-2 text-[10px] font-bold text-nung-red uppercase tracking-wider flex items-center">
                  <i className="fa-solid fa-circle-exclamation mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2"
              >
                <i className="fa-solid fa-lock mr-2" />
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border-2 border-black font-bold focus:bg-gray-50 outline-none transition-all ${
                    errors.password ? "border-nung-red" : "border-black"
                  }`}
                  placeholder="Tối thiểu 8 ký tự"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  <i
                    className={`fa-solid ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  />
                </button>
              </div>
              {/* Password Strength Indicator (Lite) */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 border border-black/10 transition-all ${
                          passwordStrength.score >= level
                            ? passwordStrength.color
                            : "bg-gray-50"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                    Độ mạnh:{" "}
                    <span className="text-black">{passwordStrength.label}</span>
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="mt-2 text-[10px] font-bold text-nung-red uppercase tracking-wider flex items-center">
                  <i className="fa-solid fa-circle-exclamation mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2"
              >
                <i className="fa-solid fa-lock mr-2" />
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
                  className={`w-full px-4 py-3 pr-12 border-2 border-black font-bold focus:bg-gray-50 outline-none transition-all ${
                    errors.confirmPassword
                      ? "border-nung-red"
                      : formData.confirmPassword &&
                        formData.password === formData.confirmPassword
                      ? "border-green-500"
                      : "border-black"
                  }`}
                  placeholder="Nhập lại mật khẩu"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  <i
                    className={`fa-solid ${
                      showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  />
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-[10px] font-bold text-nung-red uppercase tracking-wider flex items-center">
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
                  className="w-4 h-4 mt-0.5 border-2 border-black text-black focus:ring-black cursor-pointer"
                />
                <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-black transition-colors leading-relaxed">
                  Đồng ý với{" "}
                  <a
                    href="#"
                    className="text-black underline decoration-2 underline-offset-4"
                    onClick={(e) => e.preventDefault()}
                  >
                    Điều khoản
                  </a>{" "}
                  và{" "}
                  <a
                    href="#"
                    className="text-black underline decoration-2 underline-offset-4"
                  >
                    Bảo mật
                  </a>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-2 text-[10px] font-bold text-nung-red uppercase tracking-wider flex items-center">
                  <i className="fa-solid fa-circle-exclamation mr-1" />
                  {errors.acceptTerms}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-4 bg-black text-white border-2 border-black font-bold uppercase tracking-widest text-xs shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <i className="fa-solid fa-circle-notch fa-spin" />
              ) : (
                <>
                  Đăng ký ngay
                  <i className="fa-solid fa-arrow-right ml-2" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <p className="text-center mt-8 text-gray-500 font-bold uppercase text-[10px] tracking-widest">
          Đã có tài khoản?{" "}
          <button
            onClick={() => setRoute(AppRoute.LOGIN)}
            className="text-black hover:text-nung-red underline decoration-2 underline-offset-4 transition-colors ml-1"
          >
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
