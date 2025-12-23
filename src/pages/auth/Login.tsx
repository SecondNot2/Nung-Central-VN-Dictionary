import React, { useState } from "react";
import { ToastContainer, useToast } from "../../components";
import { AppRoute } from "../../types";
import { signIn, signInWithGoogle } from "../../services/api/authService";

interface LoginProps {
  setRoute: (route: AppRoute) => void;
  onLogin: (user: {
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
  }) => void;
}

const Login: React.FC<LoginProps> = ({ setRoute, onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [showPassword, setShowPassword] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.success && result.user) {
        const user = {
          id: result.user.id,
          email: result.user.email || email,
          name: result.profile?.display_name || email.split("@")[0],
          role: (result.profile?.role === "admin" ? "admin" : "user") as
            | "user"
            | "admin",
        };

        if (rememberMe) {
          localStorage.setItem("auth_user", JSON.stringify(user));
        }

        addToast("Đăng nhập thành công!", "success");

        setTimeout(() => {
          onLogin(user);
          setRoute(AppRoute.DICTIONARY);
        }, 500);
      } else {
        addToast(result.error || "Đăng nhập thất bại", "error");
      }
    } catch (err) {
      addToast("Lỗi kết nối. Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        addToast(result.error || "Đăng nhập Google thất bại", "error");
      }
      // If success, Supabase will redirect and handle the callback
    } catch (err) {
      addToast("Lỗi đăng nhập Google", "error");
    } finally {
      setGoogleLoading(false);
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
      <div className="absolute top-0 right-0 w-64 h-64 bg-nung-red/5 -rotate-12 translate-x-20 -translate-y-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-nung-blue/5 rotate-12 -translate-x-20 translate-y-20 pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white border-2 border-black mb-4 shadow-brutal-sm">
            <i className="fa-solid fa-language text-2xl" />
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-black mb-1">
            Đăng nhập
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
            Chào mừng trở lại với NungDic
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border-2 border-black shadow-brutal p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors({ ...errors, password: undefined });
                  }}
                  className={`w-full px-4 py-3 pr-12 border-2 border-black font-bold focus:bg-gray-50 outline-none transition-all ${
                    errors.password ? "border-nung-red" : "border-black"
                  }`}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
              {errors.password && (
                <p className="mt-2 text-[10px] font-bold text-nung-red uppercase tracking-wider flex items-center">
                  <i className="fa-solid fa-circle-exclamation mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border-2 border-black text-black focus:ring-black cursor-pointer"
                />
                <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-black transition-colors">
                  Ghi nhớ
                </span>
              </label>
              <button
                type="button"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
              >
                Quên mật khẩu?
              </button>
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
                  Đăng nhập
                  <i className="fa-solid fa-arrow-right ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-black/10" />
            </div>
            <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.2em]">
              <span className="px-4 bg-white text-gray-400">Hoặc</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="flex items-center justify-center px-4 py-3 border-2 border-black font-bold text-[10px] uppercase transition-all shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5"
            >
              {googleLoading ? (
                <i className="fa-solid fa-circle-notch fa-spin" />
              ) : (
                <>
                  <i className="fa-brands fa-google mr-2" />
                  Google
                </>
              )}
            </button>
            <button
              type="button"
              className="flex items-center justify-center px-4 py-3 border-2 border-black font-bold text-[10px] uppercase transition-all shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <i className="fa-brands fa-facebook-f mr-2 text-blue-600" />
              Facebook
            </button>
          </div>
        </div>

        {/* Register Link */}
        <p className="text-center mt-8 text-gray-500 font-bold uppercase text-[10px] tracking-widest">
          Chưa có tài khoản?{" "}
          <button
            onClick={() => setRoute(AppRoute.REGISTER)}
            className="text-black hover:text-nung-red underline decoration-2 underline-offset-4 transition-colors ml-1"
          >
            Đăng ký ngay
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
