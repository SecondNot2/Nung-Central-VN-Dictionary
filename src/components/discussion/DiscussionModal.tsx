import React, { useState, useEffect, useRef } from "react";
import {
  Discussion,
  SortOption,
  getDiscussions,
  createDiscussion,
  toggleLike,
  deleteDiscussion,
  generateTranslationKey,
} from "../../services/api/discussionService";
import { createReport } from "../../services/api/reportService";
import DiscussionItem from "../discussion/DiscussionItem";
import Pagination from "../common/Pagination";
import { User, TranslationResult } from "../../types";
import {
  supabase,
  isSupabaseConfigured,
} from "../../services/api/supabaseClient";

interface DiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  targetLang: string;
  user: User | null;
  result: TranslationResult | null;
  onLoginRequired?: () => void;
}

const DiscussionModal: React.FC<DiscussionModalProps> = ({
  isOpen,
  onClose,
  originalText,
  targetLang,
  user,
  result,
  onLoginRequired,
}) => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likingId, setLikingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);
  const discussionListRef = useRef<HTMLDivElement>(null);

  const perPage = 10;
  const translationKey = generateTranslationKey(originalText, targetLang);

  // Fetch total count
  const fetchTotalCount = async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const { count } = await supabase
        .from("discussions")
        .select("*", { count: "exact", head: true })
        .eq("translation_key", translationKey);
      setTotalCount(count || 0);
    } catch (err) {
      console.error("Error fetching total count:", err);
    }
  };

  // Fetch discussions
  useEffect(() => {
    if (!isOpen) return;

    const fetchDiscussions = async () => {
      setLoading(true);
      const result = await getDiscussions(
        translationKey,
        currentPage,
        perPage,
        sortBy,
        user?.id
      );
      setDiscussions(result.discussions);
      await fetchTotalCount();
      setLoading(false);
    };

    fetchDiscussions();
  }, [translationKey, currentPage, sortBy, user?.id, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleSubmitComment = async () => {
    if (!user) {
      onLoginRequired?.();
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    const created = await createDiscussion(translationKey, user.id, newComment);
    if (created) {
      const result = await getDiscussions(
        translationKey,
        1,
        perPage,
        sortBy,
        user.id
      );
      setDiscussions(result.discussions);
      await fetchTotalCount();
      setCurrentPage(1);
      setNewComment("");
    }
    setSubmitting(false);
  };

  const handleLike = async (discussionId: string) => {
    if (!user) {
      onLoginRequired?.();
      return;
    }

    setLikingId(discussionId);
    const result = await toggleLike(discussionId, user.id);
    if (result) {
      const updateLikeState = (items: Discussion[]): Discussion[] => {
        return items.map((d) => {
          if (d.id === discussionId) {
            return {
              ...d,
              is_liked_by_user: result.liked,
              like_count: result.newCount,
            };
          }
          if (d.replies) {
            return { ...d, replies: updateLikeState(d.replies) };
          }
          return d;
        });
      };
      setDiscussions(updateLikeState);
    }
    setLikingId(null);
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!user) return;
    const created = await createDiscussion(
      translationKey,
      user.id,
      content,
      parentId
    );
    if (created) {
      const result = await getDiscussions(
        translationKey,
        currentPage,
        perPage,
        sortBy,
        user.id
      );
      setDiscussions(result.discussions);
      await fetchTotalCount();
    }
  };

  const handleDelete = async (discussionId: string) => {
    const success = await deleteDiscussion(discussionId);
    if (success) {
      const result = await getDiscussions(
        translationKey,
        currentPage,
        perPage,
        sortBy,
        user?.id
      );
      setDiscussions(result.discussions);
      await fetchTotalCount();
    }
  };

  const handleReport = async (discussionId: string) => {
    if (!user) return;
    const success = await createReport(discussionId, user.id);
    if (success) {
      setToast({ message: "Đã báo cáo bình luận", type: "info" });
    } else {
      setToast({
        message: "Không thể báo cáo. Vui lòng thử lại.",
        type: "error",
      });
    }
  };

  if (!isOpen) return null;

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Mới nhất" },
    { value: "oldest", label: "Cũ nhất" },
    { value: "most_liked", label: "Phổ biến nhất" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content (Lite) */}
      <div className="relative bg-white border-2 border-black shadow-brutal w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-black text-white border-b-2 border-black">
          <h2 className="text-xl font-black uppercase tracking-tight">
            Thảo luận bản dịch
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 border-2 border-white bg-white text-black flex items-center justify-center hover:bg-nung-red hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Translation Result Summary (Lite) */}
          {result && (
            <div className="px-6 py-6 bg-gray-50 border-b-2 border-black">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {result.translations.map((trans, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white border-2 border-black shadow-brutal-sm"
                  >
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                      {trans.language}
                    </span>
                    <p className="text-xl font-black text-black leading-tight">
                      {trans.script}
                    </p>
                    <p className="text-sm text-nung-red italic font-bold mt-1">
                      {trans.phonetic || "Chưa có phiên âm"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Definitions preview */}
              {result.definitions && result.definitions.length > 0 && (
                <div className="mt-6 pt-4 border-t-2 border-black/10">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    Từ vựng liên quan
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.definitions.slice(0, 3).map((def, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white border-2 border-black text-xs font-bold"
                      >
                        {def.word}
                      </span>
                    ))}
                    {result.definitions.length > 3 && (
                      <span className="px-2 py-1 text-[10px] font-black uppercase text-gray-400">
                        +{result.definitions.length - 3} từ khác
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comment Input (Lite) */}
          <div className="px-6 py-6 border-b-2 border-black bg-white">
            <div className="flex gap-4">
              <div className="w-12 h-12 border-2 border-black bg-gray-100 flex items-center justify-center flex-shrink-0 shadow-brutal-sm">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="fa-solid fa-user text-black text-lg" />
                )}
              </div>
              <div className="flex-1 flex items-center border-2 border-black bg-white px-4 py-3 shadow-brutal-sm">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment();
                    }
                  }}
                  placeholder={
                    user ? "Viết bình luận..." : "Đăng nhập để bình luận"
                  }
                  disabled={!user}
                  className="flex-1 bg-transparent outline-none text-black font-medium placeholder-gray-400 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!user || !newComment.trim() || submitting}
                  className="ml-3 text-black hover:text-nung-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <i className="fa-solid fa-circle-notch fa-spin text-xl" />
                  ) : (
                    <i className="fa-solid fa-paper-plane text-xl" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sort & Count (Lite) */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-gray-50">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {totalCount} bình luận
              </span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border-2 border-black bg-white text-[10px] font-black uppercase tracking-widest outline-none shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    SẮP XẾP: {opt.label.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Discussions List */}
          <div ref={discussionListRef} className="px-6 py-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-earth-200" />
                    <div className="flex-1">
                      <div className="bg-earth-100 rounded-2xl p-3">
                        <div className="h-4 bg-earth-200 rounded w-1/4 mb-2" />
                        <div className="h-3 bg-earth-200 rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : discussions.length > 0 ? (
              <div className="space-y-4">
                {discussions.map((d) => (
                  <DiscussionItem
                    key={d.id}
                    discussion={d}
                    user={user}
                    onLike={handleLike}
                    onReply={handleReply}
                    onDelete={handleDelete}
                    onReport={handleReport}
                    onToast={(message, type) => setToast({ message, type })}
                    isLiking={likingId === d.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-earth-400">
                <i className="fa-regular fa-comment-dots text-5xl mb-4 block opacity-50" />
                <p className="text-lg">
                  Chưa có bình luận nào. Hãy là người đầu tiên!
                </p>
              </div>
            )}

            {/* Pagination */}
            {discussions.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalItems={totalCount}
                itemsPerPage={perPage}
                onPageChange={setCurrentPage}
                scrollRef={discussionListRef as React.RefObject<HTMLElement>}
              />
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification (Lite) */}
      {toast && (
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 border-2 border-black shadow-brutal animate-in slide-in-from-bottom-4 flex items-center gap-3 ${
            toast.type === "success"
              ? "bg-green-50 text-green-800"
              : toast.type === "error"
              ? "bg-red-50 text-red-800"
              : toast.type === "warning"
              ? "bg-amber-50 text-amber-800"
              : "bg-blue-50 text-blue-800"
          }`}
          onAnimationEnd={() => setTimeout(() => setToast(null), 3000)}
        >
          <i
            className={`fa-solid ${
              toast.type === "success"
                ? "fa-circle-check"
                : toast.type === "error"
                ? "fa-circle-xmark"
                : toast.type === "warning"
                ? "fa-triangle-exclamation"
                : "fa-circle-info"
            } text-lg`}
          />
          <span className="text-sm font-black uppercase tracking-widest leading-none mt-0.5">
            {toast.message}
          </span>
        </div>
      )}
    </div>
  );
};

export default DiscussionModal;
