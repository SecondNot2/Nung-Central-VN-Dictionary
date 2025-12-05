import React, { useState } from "react";
import { ToastContainer, useToast } from "../components";
import { AppRoute } from "../types";
import { signIn, signInWithGoogle } from "../services/authService";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-earth-100 via-earth-50 to-bamboo-50 px-4 py-12">
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
        <div className="absolute top-20 left-10 w-72 h-72 bg-bamboo-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-earth-200/40 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo & Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-bamboo-500 to-bamboo-700 rounded-2xl shadow-lg mb-4 transform hover:scale-105 transition-transform">
            <i className="fa-solid fa-language text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-earth-900 mb-2">
            Chào mừng trở lại
          </h1>
          <p className="text-earth-600">Đăng nhập để tiếp tục với NungDic</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-earth-200/50 p-8 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors({ ...errors, password: undefined });
                  }}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                    errors.password
                      ? "border-red-400 focus:ring-red-500"
                      : "border-earth-300 focus:ring-bamboo-500"
                  } focus:ring-2 focus:border-transparent outline-none transition-all bg-white text-earth-900 placeholder-earth-400`}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
              {errors.password && (
                <p className="mt-2 text-sm text-red-500 flex items-center">
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
                  className="w-4 h-4 rounded border-earth-300 text-bamboo-600 focus:ring-bamboo-500 cursor-pointer"
                />
                <span className="ml-2 text-sm text-earth-600 group-hover:text-earth-800 transition-colors">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-bamboo-600 hover:text-bamboo-700 font-medium transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center ${
                loading
                  ? "bg-earth-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-bamboo-600 to-bamboo-700 hover:from-bamboo-700 hover:to-bamboo-800 hover:shadow-xl active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin mr-2" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  Đăng nhập
                  <i className="fa-solid fa-arrow-right ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-earth-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-earth-500">
                hoặc đăng nhập với
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className={`flex items-center justify-center px-4 py-3 border border-earth-300 rounded-xl transition-all ${
                googleLoading
                  ? "bg-earth-100 cursor-not-allowed"
                  : "text-earth-700 hover:bg-earth-50 hover:border-earth-400"
              }`}
            >
              {googleLoading ? (
                <i className="fa-solid fa-circle-notch fa-spin mr-2" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center px-4 py-3 border border-earth-300 rounded-xl text-earth-700 hover:bg-earth-50 hover:border-earth-400 transition-all"
            >
              <i className="fa-brands fa-facebook-f text-blue-600 mr-2" />
              Facebook
            </button>
          </div>
        </div>

        {/* Register Link */}
        <p className="text-center mt-8 text-earth-600 animate-fade-in">
          Chưa có tài khoản?{" "}
          <button
            onClick={() => setRoute(AppRoute.REGISTER)}
            className="text-bamboo-600 hover:text-bamboo-700 font-semibold transition-colors"
          >
            Đăng ký ngay
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
