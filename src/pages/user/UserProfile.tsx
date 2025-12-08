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
      <div className="min-h-screen flex items-center justify-center bg-earth-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <i className="fa-solid fa-user-slash text-4xl text-earth-400 mb-4" />
          <h2 className="text-xl font-bold text-earth-900 mb-2">
            Chưa đăng nhập
          </h2>
          <p className="text-earth-600 mb-4">
            Vui lòng đăng nhập để xem hồ sơ.
          </p>
          <button
            onClick={() => setRoute(AppRoute.LOGIN)}
            className="px-6 py-2 bg-bamboo-600 text-white rounded-lg hover:bg-bamboo-700 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 via-white to-bamboo-50/30 py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Image Cropper Modal */}
      {cropperImage && (
        <ImageCropper
          imageSrc={cropperImage}
          onCropComplete={handleCroppedImage}
          onCancel={handleCancelCrop}
        />
      )}

      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setRoute(AppRoute.DICTIONARY)}
            className="p-2 hover:bg-earth-100 rounded-lg transition-colors"
          >
            <i className="fa-solid fa-arrow-left text-earth-600" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-earth-900">
              Hồ sơ cá nhân
            </h1>
            <p className="text-earth-600 text-sm">
              Quản lý thông tin tài khoản của bạn
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
            <div className="bg-white rounded-2xl p-6 border border-earth-200/50 shadow-sm">
              <h2 className="text-lg font-semibold text-earth-900 mb-4">
                Ảnh đại diện
              </h2>
              <div className="flex items-center gap-6">
                <div
                  className={`relative w-24 h-24 rounded-full overflow-hidden border-4 transition-all ${
                    dragOver
                      ? "border-bamboo-500 scale-105"
                      : "border-earth-200"
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
                    <div className="w-full h-full bg-gradient-to-br from-bamboo-400 to-bamboo-600 flex items-center justify-center text-white text-3xl font-bold">
                      {(profile?.display_name ||
                        user.email)?.[0]?.toUpperCase()}
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <i className="fa-solid fa-circle-notch fa-spin text-white text-xl" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
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
                    className="px-4 py-2 bg-bamboo-600 text-white rounded-lg hover:bg-bamboo-700 disabled:opacity-50 transition-colors"
                  >
                    <i className="fa-solid fa-upload mr-2" />
                    Tải ảnh lên
                  </button>
                  <p className="text-sm text-earth-500 mt-2">
                    Kéo thả ảnh hoặc click để chọn. Ảnh sẽ tự động được tối ưu.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="bg-white rounded-2xl p-6 border border-earth-200/50 shadow-sm">
              <h2 className="text-lg font-semibold text-earth-900 mb-4">
                Thông tin cá nhân
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="displayName"
                    className="block text-sm font-medium text-earth-700 mb-1"
                  >
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nhập họ tên của bạn"
                    className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-bamboo-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-earth-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profile?.email || user.email}
                    disabled
                    className="w-full px-4 py-2 border border-earth-200 rounded-lg bg-earth-50 text-earth-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1">
                    Quyền hạn
                  </label>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                      profile?.role === "admin"
                        ? "bg-purple-50 text-purple-700"
                        : "bg-bamboo-50 text-bamboo-700"
                    }`}
                  >
                    <i
                      className={`fa-solid ${
                        profile?.role === "admin" ? "fa-shield" : "fa-user"
                      }`}
                    />
                    {profile?.role === "admin"
                      ? "Quản trị viên"
                      : "Cộng tác viên"}
                  </div>
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || displayName === profile?.display_name}
                  className="w-full py-2 bg-bamboo-600 text-white rounded-lg hover:bg-bamboo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <i className="fa-solid fa-circle-notch fa-spin" />
                  ) : (
                    "Lưu thay đổi"
                  )}
                </button>
              </div>
            </div>

            {/* Email Verification */}
            <div className="bg-white rounded-2xl p-6 border border-earth-200/50 shadow-sm">
              <h2 className="text-lg font-semibold text-earth-900 mb-4">
                Xác thực email
              </h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      profile?.email_verified
                        ? "bg-green-100 text-green-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    <i
                      className={`fa-solid ${
                        profile?.email_verified ? "fa-check" : "fa-clock"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-earth-900">
                      {profile?.email_verified
                        ? "Email đã xác thực"
                        : "Email chưa xác thực"}
                    </p>
                    <p className="text-sm text-earth-500">
                      {profile?.email_verified
                        ? "Tài khoản của bạn đã được xác thực"
                        : "Vui lòng kiểm tra email để xác thực"}
                    </p>
                  </div>
                </div>
                {!profile?.email_verified && (
                  <button
                    onClick={handleResendVerification}
                    disabled={sendingEmail}
                    className="px-4 py-2 border border-bamboo-300 text-bamboo-700 rounded-lg hover:bg-bamboo-50 disabled:opacity-50 transition-colors"
                  >
                    {sendingEmail ? (
                      <i className="fa-solid fa-circle-notch fa-spin" />
                    ) : (
                      "Gửi lại"
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl p-6 border border-earth-200/50 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-earth-900">
                  Đổi mật khẩu
                </h2>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="text-bamboo-600 hover:text-bamboo-700 text-sm font-medium"
                >
                  {showPasswordForm ? "Hủy" : "Thay đổi"}
                </button>
              </div>
              {showPasswordForm && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-earth-700 mb-1"
                    >
                      Mật khẩu hiện tại
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-bamboo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-earth-700 mb-1"
                    >
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 8 ký tự"
                      className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-bamboo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-earth-700 mb-1"
                    >
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-bamboo-500 focus:border-transparent outline-none"
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
                    className="w-full py-2 bg-earth-800 text-white rounded-lg hover:bg-earth-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {changingPassword ? (
                      <i className="fa-solid fa-circle-notch fa-spin" />
                    ) : (
                      "Đổi mật khẩu"
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
