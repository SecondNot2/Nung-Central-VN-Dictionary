import React, { useState, useEffect } from "react";
import { ToastContainer, useToast, ConfirmDialog } from "../../components";
import {
  submitContribution,
  getContributions,
  deleteContribution as deleteContributionService,
} from "../../services/api/contributionService";
import { Contribution, User, AppRoute } from "../../types";

// Language Options
const languageOptions = [
  { value: "vi", label: "Tiếng Việt", icon: "fa-flag" },
  { value: "nung", label: "Tiếng Nùng (Lạng Sơn)", icon: "fa-mountain" },
  { value: "central", label: "Tiếng Nghệ An / Hà Tĩnh", icon: "fa-wheat-awn" },
];

const regionOptions = [
  { value: "", label: "Chọn vùng miền (tùy chọn)" },
  { value: "lang-son", label: "Lạng Sơn" },
  { value: "cao-bang", label: "Cao Bằng" },
  { value: "bac-kan", label: "Bắc Kạn" },
  { value: "tuyen-quang", label: "Tuyên Quang" },
  { value: "thai-nguyen", label: "Thái Nguyên" },
  { value: "quang-ninh", label: "Quảng Ninh" },
  { value: "nghe-an", label: "Nghệ An" },
  { value: "ha-tinh", label: "Hà Tĩnh" },
  { value: "other", label: "Khác" },
];

interface ContributeProps {
  user: User | null;
  setRoute: (route: AppRoute) => void;
}

const Contribute: React.FC<ContributeProps> = ({ user, setRoute }) => {
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [sourceLang, setSourceLang] = useState("vi");
  const [targetLang, setTargetLang] = useState("nung");
  const [phonetic, setPhonetic] = useState("");
  const [region, setRegion] = useState("");
  const [example, setExample] = useState("");
  const [meaning, setMeaning] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);

  // Confirmation dialogs
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  // Load contributions from Supabase
  useEffect(() => {
    const loadContributions = async () => {
      setLoading(true);
      const result = await getContributions();
      if (result.success) {
        setContributions(result.data);
      }
      setLoading(false);
    };
    loadContributions();
  }, []);

  // Get filtered target options (exclude source language)
  const getTargetOptions = () => {
    return languageOptions.filter((opt) => opt.value !== sourceLang);
  };

  // Handle form validation before showing confirm
  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();

    if (!word.trim() || !translation.trim()) {
      addToast("Vui lòng nhập từ/cụm từ và bản dịch", "warning");
      return;
    }

    // Check if user is logged in
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    setShowSubmitConfirm(true);
  };

  // Confirmed submission
  const handleConfirmedSubmit = async () => {
    setShowSubmitConfirm(false);
    setSubmitting(true);

    const result = await submitContribution({
      word: word.trim(),
      translation: translation.trim(),
      source_lang: sourceLang,
      target_lang: targetLang,
      phonetic: phonetic.trim() || undefined,
      region: region || undefined,
      example: example.trim() || undefined,
      meaning: meaning.trim() || undefined,
    });

    if (result.success && result.data) {
      setContributions([result.data, ...contributions]);

      // Reset form
      setWord("");
      setTranslation("");
      setPhonetic("");
      setExample("");
      setMeaning("");

      addToast(
        result.error || "Cảm ơn bạn! Đóng góp đã được gửi thành công.",
        result.error ? "info" : "success"
      );
    } else {
      addToast("Có lỗi xảy ra. Vui lòng thử lại.", "error");
    }

    setSubmitting(false);
  };

  // Show delete confirmation
  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  // Confirmed deletion
  const handleConfirmedDelete = async () => {
    if (!deleteTargetId) return;

    const result = await deleteContributionService(deleteTargetId);
    if (result.success) {
      setContributions(contributions.filter((c) => c.id !== deleteTargetId));
      addToast("Đã xóa đóng góp", "info");
    } else {
      addToast(result.error || "Không thể xóa đóng góp", "error");
    }

    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
  };

  // Get language label
  const getLangLabel = (code: string) => {
    return languageOptions.find((l) => l.value === code)?.label || code;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <i className="fa-solid fa-check"></i> Đã duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <i className="fa-solid fa-xmark"></i> Từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <i className="fa-solid fa-clock"></i> Chờ duyệt
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-nung-sand bg-paper py-12 px-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Submit Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSubmitConfirm}
        title="Xác nhận gửi đóng góp"
        message={`Bạn có chắc muốn gửi từ "${word}" với bản dịch "${translation}"?`}
        confirmText="Gửi đóng góp"
        cancelText="Hủy"
        type="info"
        onConfirm={handleConfirmedSubmit}
        onCancel={() => setShowSubmitConfirm(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Xóa đóng góp?"
        message="Đóng góp này sẽ bị xóa vĩnh viễn. Bạn có chắc chắn không?"
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        onConfirm={handleConfirmedDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteTargetId(null);
        }}
      />

      {/* Login Prompt Dialog */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowLoginPrompt(false)}
          />

          {/* Dialog */}
          <div className="relative transform bg-white border-4 border-black shadow-brutal-lg w-full max-w-md animate-fade-in z-10">
            <div className="p-8">
              {/* Icon */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center border-4 border-black bg-nung-sand text-nung-red mb-6 shadow-brutal-sm -rotate-3 transition-transform hover:rotate-0">
                <i className="fa-solid fa-right-to-bracket text-3xl"></i>
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="text-3xl font-display font-black text-nung-dark mb-4 uppercase tracking-tighter">
                  Yêu cầu đăng nhập
                </h3>
                <p className="text-gray-600 font-serif font-bold">
                  Bản cần đồng hành cùng chúng tôi để gửi đóng góp. <br />
                  Hãy đăng nhập hoặc tạo tài khoản mới ngay!
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-paper border-t-4 border-black p-6 flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  setRoute(AppRoute.LOGIN);
                }}
                className="w-full py-4 bg-black text-white font-black uppercase tracking-widest border-2 border-black shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                <i className="fa-solid fa-right-to-bracket mr-2"></i>
                Đăng nhập ngay
              </button>
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  setRoute(AppRoute.REGISTER);
                }}
                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest border-2 border-black shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                <i className="fa-solid fa-user-plus mr-2"></i>
                Tạo tài khoản
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full py-2 font-black text-gray-500 hover:text-black uppercase tracking-widest text-xs transition-colors"
              >
                Để sau tính tiếp
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white border-4 border-black shadow-brutal p-8 md:p-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-nung-red/5 -mr-32 -mt-32 rounded-full blur-3xl pointer-events-none"></div>
        <div className="text-center mb-12 relative z-10">
          <div className="w-24 h-24 bg-nung-sand border-4 border-black text-nung-red flex items-center justify-center mx-auto mb-6 shadow-brutal transition-transform hover:scale-110 hover:-rotate-12 duration-300 -rotate-3">
            <i className="fa-solid fa-hand-holding-heart text-4xl"></i>
          </div>
          <h2 className="text-5xl font-display font-black text-nung-dark uppercase tracking-tighter mb-4">
            Góp tay xây bản
          </h2>
          <p className="text-gray-600 font-serif font-bold text-lg max-w-2xl mx-auto leading-relaxed">
            Mỗi đóng góp của bạn là một viên gạch quý báu để bảo tồn{" "}
            <br className="hidden md:block" />
            hồn thiêng ngôn ngữ Nùng và văn hóa xứ Lạng.
          </p>
        </div>

        <form onSubmit={handleSubmitClick} className="space-y-6">
          {/* Language Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black text-nung-dark uppercase tracking-widest mb-3">
                <i className="fa-solid fa-language mr-2 text-nung-red"></i>
                Ngôn ngữ gốc
              </label>
              <select
                value={sourceLang}
                onChange={(e) => {
                  setSourceLang(e.target.value);
                  if (e.target.value === targetLang) {
                    setTargetLang(e.target.value === "vi" ? "nung" : "vi");
                  }
                }}
                className="w-full border-4 border-black px-4 py-4 focus:bg-nung-sand/10 outline-none text-nung-dark font-bold bg-white shadow-brutal-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all appearance-none cursor-pointer"
              >
                {languageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-nung-dark uppercase tracking-widest mb-3">
                <i className="fa-solid fa-arrow-right mr-2 text-nung-red"></i>
                Ngôn ngữ dịch
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full border-4 border-black px-4 py-4 focus:bg-nung-sand/10 outline-none text-nung-dark font-bold bg-white shadow-brutal-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all appearance-none cursor-pointer"
              >
                {getTargetOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Word/Phrase Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black text-nung-dark uppercase tracking-widest mb-3">
                <i className="fa-solid fa-pen mr-2 text-nung-red"></i>
                Từ / Cụm từ gốc <span className="text-nung-red">*</span>
              </label>
              <input
                required
                value={word}
                onChange={(e) => setWord(e.target.value)}
                type="text"
                className="w-full border-4 border-black px-4 py-4 focus:bg-nung-sand/10 outline-none text-nung-dark font-bold text-lg shadow-brutal-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                placeholder={`Nhập từ ${getLangLabel(sourceLang)}`}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-nung-dark uppercase tracking-widest mb-3">
                <i className="fa-solid fa-language mr-2 text-nung-red"></i>
                Bản dịch <span className="text-nung-red">*</span>
              </label>
              <input
                required
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                type="text"
                className="w-full border-4 border-black px-4 py-4 focus:bg-nung-sand/10 outline-none text-nung-dark font-bold text-lg shadow-brutal-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                placeholder={`Dịch sang ${getLangLabel(targetLang)}`}
              />
            </div>
          </div>

          {/* Phonetic & Region */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black text-nung-dark uppercase tracking-widest mb-3">
                <i className="fa-solid fa-volume-high mr-2 text-nung-red"></i>
                Phiên âm / Cách đọc
              </label>
              <input
                value={phonetic}
                onChange={(e) => setPhonetic(e.target.value)}
                type="text"
                className="w-full border-4 border-black px-4 py-4 focus:bg-nung-sand/10 outline-none text-nung-dark font-bold shadow-brutal-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                placeholder="Ví dụ: /piː vaŋ miː/"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-nung-dark uppercase tracking-widest mb-3">
                <i className="fa-solid fa-map-location-dot mr-2 text-nung-red"></i>
                Vùng miền / Phương ngữ
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full border-4 border-black px-4 py-4 focus:bg-nung-sand/10 outline-none text-nung-dark font-bold bg-white shadow-brutal-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all appearance-none cursor-pointer"
              >
                {regionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Example */}
          <div>
            <label className="block text-xs font-black text-nung-dark uppercase tracking-widest mb-3">
              <i className="fa-solid fa-quote-left mr-2 text-nung-red"></i>
              Câu ví dụ minh họa
            </label>
            <input
              value={example}
              onChange={(e) => setExample(e.target.value)}
              type="text"
              className="w-full border-4 border-black px-4 py-4 focus:bg-nung-sand/10 outline-none text-nung-dark font-bold shadow-brutal-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
              placeholder="Ví dụ câu sử dụng từ này trong ngữ cảnh thực tế"
            />
          </div>

          {/* Meaning & Context */}
          <div>
            <label className="block text-xs font-black text-nung-dark uppercase tracking-widest mb-3">
              <i className="fa-solid fa-book mr-2 text-nung-red"></i>Ý nghĩa &
              Ngữ cảnh đặc biệt
            </label>
            <textarea
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              className="w-full border-4 border-black px-4 py-4 focus:bg-nung-sand/10 outline-none h-32 text-nung-dark font-bold shadow-brutal-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all resize-none"
              placeholder="Giải thích ý nghĩa chi tiết, hoàn cảnh sử dụng, hoặc các ghi chú văn hóa nếu có..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-5 bg-black text-white font-black uppercase tracking-widest border-2 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-nung-red translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10 flex items-center justify-center">
              {submitting ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin mr-3"></i>
                  Đang ghi nhận...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane mr-3 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"></i>
                  Gửi đóng góp của bạn
                </>
              )}
            </span>
          </button>
        </form>

        {/* Contribution History Toggle */}
        <div className="mt-16 border-t-4 border-black pt-10 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-6 py-2 border-2 border-black font-black uppercase tracking-widest text-sm shadow-brutal-sm rotate-1">
            Nhật ký cống hiến
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between group p-4 border-2 border-black bg-nung-sand/30 hover:bg-nung-sand transition-colors"
          >
            <span className="font-black uppercase tracking-widest text-nung-dark flex items-center">
              <i className="fa-solid fa-clock-rotate-left mr-3 text-nung-red"></i>
              Lịch sử đóng góp của bạn ({contributions.length})
            </span>
            <i
              className={`fa-solid fa-chevron-down border-2 border-black w-8 h-8 flex items-center justify-center transition-transform ${
                showHistory
                  ? "rotate-180 bg-black text-white"
                  : "bg-white text-black"
              }`}
            ></i>
          </button>

          {showHistory && (
            <div className="mt-8 space-y-6 max-h-[1000px] overflow-y-auto pr-2 custom-scrollbar animate-fade-in">
              {loading ? (
                <div className="text-center py-12 bg-white border-2 border-dashed border-black">
                  <i className="fa-solid fa-circle-notch fa-spin text-4xl text-nung-red mb-4"></i>
                  <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">
                    Đang truy xuất dữ liệu...
                  </p>
                </div>
              ) : contributions.length === 0 ? (
                <div className="text-center py-12 bg-white border-2 border-dashed border-black">
                  <i className="fa-solid fa-inbox text-4xl text-gray-300 mb-4"></i>
                  <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">
                    Chưa có đóng góp nào được ghi lại
                  </p>
                </div>
              ) : (
                contributions.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white border-4 border-black p-6 shadow-brutal-sm group relative hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 pb-4 border-b-2 border-dotted border-black">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-brutal-sm">
                          {getLangLabel(c.source_lang)}
                        </span>
                        <i className="fa-solid fa-arrow-right text-gray-400"></i>
                        <span className="bg-nung-blue text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-brutal-sm">
                          {getLangLabel(c.target_lang)}
                        </span>
                        {c.region && (
                          <span className="text-xs font-bold text-nung-red bg-nung-red/5 px-2 py-1 border border-nung-red/20 rotate-1 italic">
                            # {c.region}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 ml-auto sm:ml-0">
                        {getStatusBadge(c.status)}
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1">
                          {new Date(c.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div className="bg-paper bg-nung-sand/10 p-4 border-2 border-black rotate-1">
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">
                          Gốc:
                        </p>
                        <p className="text-xl font-display font-black text-nung-dark">
                          {c.word}
                        </p>
                      </div>
                      <div className="bg-paper bg-white p-4 border-2 border-black -rotate-1 shadow-brutal-sm">
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">
                          Dịch:
                        </p>
                        <p className="text-xl font-display font-black text-nung-blue">
                          {c.translation}
                        </p>
                        {c.phonetic && (
                          <p className="text-sm font-serif font-black text-nung-red mt-2 flex items-center gap-2">
                            <i className="fa-solid fa-volume-high text-xs"></i>
                            {c.phonetic}
                          </p>
                        )}
                      </div>
                    </div>
                    {(c.example || c.meaning) && (
                      <div className="space-y-3 bg-gray-50 p-4 border-2 border-black">
                        {c.example && (
                          <p className="text-sm font-serif font-bold text-gray-700 italic flex items-start gap-2">
                            <i className="fa-solid fa-quote-left text-nung-red text-xs mt-1"></i>
                            {c.example}
                          </p>
                        )}
                        {c.meaning && (
                          <p className="text-sm font-serif font-medium text-gray-600 border-t border-gray-200 pt-2">
                            {c.meaning}
                          </p>
                        )}
                      </div>
                    )}
                    {c.status === "rejected" && c.reject_reason && (
                      <p className="text-xs font-black text-white bg-nung-red mt-4 p-3 border-2 border-black shadow-brutal-sm uppercase tracking-tight">
                        <i className="fa-solid fa-circle-info mr-2"></i>
                        Phản hồi: {c.reject_reason}
                      </p>
                    )}
                    {c.status === "pending" && (
                      <button
                        onClick={() => handleDeleteClick(c.id)}
                        className="absolute -top-3 -right-3 w-10 h-10 bg-white text-black border-2 border-black hover:bg-nung-red hover:text-white transition-all shadow-brutal-sm flex items-center justify-center rotate-12 hover:rotate-0"
                        title="Xóa đóng góp"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contribute;
