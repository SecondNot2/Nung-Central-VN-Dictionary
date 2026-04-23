import React, { useState, useEffect, useRef } from "react";
import { AppRoute, User } from "../../types";
import {
  getCurrentProfile,
  updateProfile,
  uploadAvatar,
  resendVerificationEmail,
  changePassword,
  verifyCurrentPassword,
  ExtendedUserProfile,
} from "../../services/api/userManagementService";
import { processAvatarImage } from "../../services/utils/imageUtils";
import { ToastContainer, useToast, ImageCropper } from "../../components";

interface UserProfileProps {
  user: User | null;
  setRoute: (route: AppRoute) => void;
  onProfileUpdate?: (updates: Partial<User>) => void;
  onLogout?: () => Promise<void>;
}

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  setRoute,
  onProfileUpdate,
  onLogout,
}) => {
  const [profile, setProfile] = useState<ExtendedUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Image cropper state
  const [cropperImage, setCropperImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLoadingRef = useRef(false); // Prevent concurrent loads
  const hasLoadedOnce = useRef(false); // Track if profile was loaded successfully
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    // Only load on initial mount or user change
    if (!hasLoadedOnce.current) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async (forceReload = false) => {
    // Prevent concurrent loads
    if (isLoadingRef.current) {
      console.log("loadProfile: Already loading, skipping...");
      return;
    }

    // Skip if already loaded and not forcing reload
    if (hasLoadedOnce.current && profile && !forceReload) {
      console.log("loadProfile: Already loaded, using cache");
      setLoading(false);
      return;
    }

    // If no user, show content immediately with fallback
    if (!user) {
      setLoading(false);
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);

    try {
      const data = await getCurrentProfile();
      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || "");
        if (onProfileUpdate) {
          onProfileUpdate({
            name: data.display_name || user.name,
            avatar: data.avatar_url || undefined,
          });
        }
        hasLoadedOnce.current = true; // Mark as loaded
      } else {
        // Fallback to user prop if profile fetch fails
        setProfile({
          id: user.id,
          email: user.email,
          display_name: user.name,
          role: user.role === "admin" ? "admin" : "contributor",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setDisplayName(user.name || "");
        hasLoadedOnce.current = true; // Still mark as loaded
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      // Use fallback profile from user prop
      setProfile({
        id: user.id,
        email: user.email,
        display_name: user.name,
        role: user.role === "admin" ? "admin" : "contributor",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setDisplayName(user.name || "");
      hasLoadedOnce.current = true; // Still mark as loaded to prevent infinite retry
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    const result = await updateProfile(user.id, {
      display_name: displayName.trim(),
    });
    setSaving(false);

    if (result.success) {
      addToast("Đã cập nhật hồ sơ", "success");
      if (onProfileUpdate) {
        onProfileUpdate({ name: displayName.trim() });
      }
      loadProfile(true); // Force reload after update
    } else {
      addToast(result.error || "Lỗi cập nhật hồ sơ", "error");
    }
  };

  // Open cropper instead of direct upload
  const handleFileSelect = async (file: File) => {
    if (!user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      addToast("Vui lòng chọn file ảnh", "error");
      return;
    }

    // Create a URL for the image and show cropper
    const imageUrl = URL.createObjectURL(file);
    setCropperImage(imageUrl);
  };

  // Handle cropped image upload
  const handleCroppedImage = async (croppedBlob: Blob) => {
    if (!user) return;

    // Close cropper and clean up URL
    if (cropperImage) {
      URL.revokeObjectURL(cropperImage);
    }
    setCropperImage(null);

    setUploading(true);

    try {
      // Convert blob to file
      const croppedFile = new File([croppedBlob], "avatar.jpg", {
        type: "image/jpeg",
      });

      // Process if needed
      let processedFile = croppedFile;
      if (croppedFile.size > 200 * 1024) {
        addToast("Đang tối ưu ảnh...", "info");
        processedFile = await processAvatarImage(croppedFile);
      }

      const result = await uploadAvatar(user.id, processedFile);

      if (result.success) {
        addToast("Đã cập nhật ảnh đại diện", "success");
        if (onProfileUpdate && result.url) {
          onProfileUpdate({ avatar: result.url });
        }
        loadProfile(true); // Force reload after avatar update
      } else {
        addToast(result.error || "Lỗi upload ảnh", "error");
      }
    } catch (err) {
      console.error("Image processing error:", err);
      addToast("Lỗi xử lý ảnh. Vui lòng thử ảnh khác.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelCrop = () => {
    if (cropperImage) {
      URL.revokeObjectURL(cropperImage);
    }
    setCropperImage(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleResendVerification = async () => {
    setSendingEmail(true);
    const result = await resendVerificationEmail();
    setSendingEmail(false);

    if (result.success) {
      addToast("Đã gửi email xác thực", "success");
    } else {
      addToast(result.error || "Lỗi gửi email", "error");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      addToast("Vui lòng nhập mật khẩu hiện tại", "error");
      return;
    }
    if (newPassword.length < 8) {
      addToast("Mật khẩu mới phải có ít nhất 8 ký tự", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast("Mật khẩu xác nhận không khớp", "error");
      return;
    }

    setChangingPassword(true);

    // Verify current password first
    const email = profile?.email || user?.email;
    if (email) {
      const verifyResult = await verifyCurrentPassword(email, currentPassword);
      if (!verifyResult.success) {
        setChangingPassword(false);
        addToast(verifyResult.error || "Mật khẩu hiện tại không đúng", "error");
        return;
      }
    }

    const result = await changePassword(newPassword);
    setChangingPassword(false);

    if (result.success) {
      addToast("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);

      // Password change invalidates the session - user must re-login
      if (result.requiresRelogin && onLogout) {
        // Small delay to show success message before logout
        setTimeout(async () => {
          await onLogout();
          setRoute(AppRoute.LOGIN);
        }, 1500);
      }
    } else {
      addToast(result.error || "Lỗi đổi mật khẩu", "error");
    }
  };

  // Check login
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nung-sand bg-paper">
        <div className="text-center p-12 bg-white border-4 border-black shadow-brutal max-w-md w-full mx-4 rotate-1">
          <div className="w-20 h-20 bg-nung-red text-white flex items-center justify-center border-2 border-black mx-auto mb-6 shadow-brutal-sm -rotate-2">
            <i className="fa-solid fa-user-slash text-3xl" />
          </div>
          <h2 className="text-3xl font-display font-bold text-nung-dark mb-4 uppercase">
            Chưa đăng nhập
          </h2>
          <p className="text-gray-600 font-serif font-bold mb-8">
            Vui lòng đăng nhập để xem hồ sơ cá nhân của bạn.
          </p>
          <button
            onClick={() => setRoute(AppRoute.LOGIN)}
            className="w-full py-4 bg-black text-white font-black uppercase tracking-widest border-2 border-black shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nung-sand bg-paper py-12 px-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Image Cropper Modal */}
      {cropperImage && (
        <ImageCropper
          imageSrc={cropperImage}
          onCropComplete={handleCroppedImage}
          onCancel={handleCancelCrop}
        />
      )}

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12 bg-white border-4 border-black p-6 shadow-brutal transform -rotate-1 relative">
          <button
            onClick={() => setRoute(AppRoute.DICTIONARY)}
            className="absolute -top-4 -left-4 w-12 h-12 bg-black text-white hover:bg-nung-red border-2 border-white flex items-center justify-center transition-all shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1"
            title="Quay lại"
          >
            <i className="fa-solid fa-arrow-left text-xl" />
          </button>
          <div className="text-center md:text-left pt-4 md:pt-0">
            <h1 className="text-4xl font-display font-black text-nung-dark uppercase tracking-tighter">
              Hồ sơ cá nhân
            </h1>
            <p className="text-gray-600 font-serif font-bold mt-1">
              Quản lý thông tin & Bảo mật tài khoản
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <i className="fa-solid fa-circle-notch fa-spin text-2xl text-bamboo-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="bg-white border-4 border-black p-8 shadow-brutal relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-full bg-paper opacity-10 pointer-events-none"></div>
              <h2 className="text-2xl font-display font-bold text-nung-dark mb-6 border-b-2 border-black pb-3 relative z-10">
                📸 Ảnh đại diện
              </h2>
              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div
                  className={`relative w-40 h-40 border-4 transition-all shadow-brutal-sm rotate-1 ${
                    dragOver ? "border-nung-red scale-105" : "border-black"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-nung-sand flex items-center justify-center text-nung-red text-6xl font-display font-black">
                      {(profile?.display_name ||
                        user.email)?.[0]?.toUpperCase()}
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                      <i className="fa-solid fa-circle-notch fa-spin text-white text-3xl" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-black text-white px-2 py-1 text-[10px] font-black uppercase tracking-tighter shadow-brutal-sm">
                    Profile Pic
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="avatar-upload"
                    name="avatar-upload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-8 py-3 bg-nung-red text-white border-2 border-black font-black uppercase tracking-widest shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
                  >
                    <i className="fa-solid fa-camera mr-2" />
                    Thay đổi ảnh
                  </button>
                  <p className="text-xs font-bold text-gray-500 mt-4 uppercase tracking-widest leading-relaxed">
                    Kéo thả ảnh hoặc click để chọn. <br />
                    Tối đa 5MB, JPG/PNG/WEBP.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="bg-white border-4 border-black p-8 shadow-brutal relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-nung-blue/5 -mr-16 -mt-16 rounded-full blur-2xl"></div>
              <h2 className="text-2xl font-display font-bold text-nung-dark mb-6 border-b-2 border-black pb-3">
                📝 Thông tin cơ bản
              </h2>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="displayName"
                    className="block text-xs font-black text-nung-dark uppercase tracking-widest mb-2"
                  >
                    Họ và tên hiển thị
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nhập họ tên của bạn"
                    className="w-full px-4 py-3 border-4 border-black outline-none focus:bg-nung-sand/10 text-nung-dark font-bold text-lg shadow-brutal-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2"
                  >
                    Địa chỉ Email (Cố định)
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-black bg-gray-100 text-gray-500 font-bold cursor-not-allowed">
                    {profile?.email || user.email}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-nung-dark uppercase tracking-widest mb-2">
                    Vai trò hệ thống
                  </label>
                  <div
                    className={`inline-flex items-center gap-3 px-4 py-2 border-2 border-black font-black uppercase tracking-tighter text-sm shadow-brutal-sm ${
                      profile?.role === "admin"
                        ? "bg-purple-600 text-white"
                        : "bg-nung-blue text-white"
                    }`}
                  >
                    <i
                      className={`fa-solid ${
                        profile?.role === "admin"
                          ? "fa-shield-halved"
                          : "fa-user-gear"
                      }`}
                    />
                    {profile?.role === "admin"
                      ? "Administrator"
                      : "Contributor"}
                  </div>
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || displayName === profile?.display_name}
                  className="w-full py-4 bg-black text-white font-black uppercase tracking-widest border-2 border-black shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {saving ? (
                    <i className="fa-solid fa-circle-notch fa-spin" />
                  ) : (
                    "Cập nhật hồ sơ"
                  )}
                </button>
              </div>
            </div>

            {/* Email Verification */}
            <div className="bg-white border-4 border-black p-8 shadow-brutal relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-full bg-paper opacity-5 pointer-events-none"></div>
              <h2 className="text-2xl font-display font-bold text-nung-dark mb-6 border-b-2 border-black pb-3 relative z-10">
                🛡️ Xác thực bảo mật
              </h2>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-5">
                  <div
                    className={`w-16 h-16 border-4 border-black flex items-center justify-center shadow-brutal-sm rotate-3 transition-transform group-hover:rotate-0 ${
                      profile?.email_verified
                        ? "bg-nung-green text-white"
                        : "bg-nung-red text-white"
                    }`}
                  >
                    <i
                      className={`fa-solid ${
                        profile?.email_verified
                          ? "fa-user-check"
                          : "fa-user-clock"
                      } text-2xl`}
                    />
                  </div>
                  <div>
                    <p className="text-xl font-display font-bold text-nung-dark uppercase tracking-tight">
                      {profile?.email_verified
                        ? "Đã xác thực Email"
                        : "Chưa xác thực Email"}
                    </p>
                    <p className="text-sm font-serif font-bold text-gray-600">
                      {profile?.email_verified
                        ? "Tài khoản của bạn ở trạng thái an toàn."
                        : "Vui lòng xác thực để bảo vệ tài khoản."}
                    </p>
                  </div>
                </div>
                {!profile?.email_verified && (
                  <button
                    onClick={handleResendVerification}
                    disabled={sendingEmail}
                    className="px-6 py-3 bg-white text-black border-2 border-black font-black uppercase tracking-widest shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
                  >
                    {sendingEmail ? (
                      <i className="fa-solid fa-circle-notch fa-spin" />
                    ) : (
                      "Gửi lại mã"
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white border-4 border-black p-8 shadow-brutal relative">
              <div className="flex items-center justify-between mb-8 border-b-2 border-dotted border-black pb-4">
                <h2 className="text-2xl font-display font-bold text-nung-dark uppercase tracking-tight">
                  🔑 Đổi mật khẩu
                </h2>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className={`px-4 py-2 border-2 border-black font-black uppercase tracking-tighter text-xs shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all ${
                    showPasswordForm
                      ? "bg-black text-white"
                      : "bg-nung-sand text-black"
                  }`}
                >
                  {showPasswordForm ? "Đóng lại" : "Thay đổi ngay"}
                </button>
              </div>
              {showPasswordForm && (
                <div className="space-y-6 animate-slide-in-bottom">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-xs font-black text-nung-dark uppercase tracking-widest mb-2"
                    >
                      Mật khẩu hiện tại
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu cũ của bạn"
                      className="w-full px-4 py-3 border-4 border-black outline-none focus:bg-nung-sand/10 text-nung-dark font-bold shadow-brutal-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-xs font-black text-nung-blue uppercase tracking-widest mb-2"
                    >
                      Mật khẩu mới (Tối thiểu 8 ký tự)
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border-4 border-black outline-none focus:bg-nung-sand/10 text-nung-dark font-bold shadow-brutal-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-black text-nung-blue uppercase tracking-widest mb-2"
                    >
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border-4 border-black outline-none focus:bg-nung-sand/10 text-nung-dark font-bold shadow-brutal-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={
                      changingPassword ||
                      !currentPassword ||
                      !newPassword ||
                      !confirmPassword
                    }
                    className="w-full py-4 bg-nung-red text-white font-black uppercase tracking-widest border-2 border-black shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changingPassword ? (
                      <i className="fa-solid fa-circle-notch fa-spin" />
                    ) : (
                      "Xác nhận đổi mật khẩu"
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Account Info */}
            <div className="bg-earth-50 rounded-2xl p-6 text-center text-earth-500 text-sm">
              <p>
                Tài khoản được tạo vào{" "}
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
