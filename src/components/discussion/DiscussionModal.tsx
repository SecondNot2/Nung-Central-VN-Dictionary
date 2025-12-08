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
import { supabase, isSupabaseConfigured } from "../../services/api/supabaseClient";

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

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-earth-200">
          <h2 className="text-xl font-bold text-earth-900">
            Thảo luận về bản dịch
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-earth-100 flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-xmark text-earth-600 text-xl" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Translation Result Summary */}
          {result && (
            <div className="px-6 py-4 bg-earth-50 border-b border-earth-200">
              {result.translations.map((trans, idx) => (
                <div key={idx} className="mb-3 last:mb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-earth-500 uppercase">
                      {trans.language}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-earth-900">
                    {trans.script}
                  </p>
                  <p className="text-sm text-bamboo-600 italic">
                    {trans.phonetic}
                  </p>
                </div>
              ))}

              {/* Definitions preview */}
              {result.definitions && result.definitions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-earth-200">
                  <p className="text-xs font-medium text-earth-500 uppercase mb-2">
                    Từ vựng
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.definitions.slice(0, 3).map((def, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white rounded-full text-sm text-earth-700 border border-earth-200"
                      >
                        {def.word}
                      </span>
                    ))}
                    {result.definitions.length > 3 && (
                      <span className="px-2 py-1 text-sm text-earth-500">
                        +{result.definitions.length - 3} từ khác
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comment Input */}
          <div className="px-6 py-4 border-b border-earth-100 bg-earth-50/50">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bamboo-400 to-bamboo-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="fa-solid fa-user text-white text-sm" />
                )}
              </div>
              <div className="flex-1 flex items-center bg-earth-100 rounded-full px-4 py-2">
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
                  className="flex-1 bg-transparent outline-none text-earth-800 placeholder-earth-400 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!user || !newComment.trim() || submitting}
                  className="ml-2 text-bamboo-600 hover:text-bamboo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <i className="fa-solid fa-circle-notch fa-spin" />
                  ) : (
                    <i className="fa-solid fa-paper-plane" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sort & Count */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between px-6 py-3 border-b border-earth-100">
              <span className="text-sm text-earth-600">
                {totalCount} bình luận
              </span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 border border-earth-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-bamboo-500 focus:border-transparent outline-none"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
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

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : toast.type === "error"
              ? "bg-red-500 text-white"
              : toast.type === "warning"
              ? "bg-amber-500 text-white"
              : "bg-blue-500 text-white"
          }`}
          onAnimationEnd={() => setTimeout(() => setToast(null), 2000)}
        >
          <i
            className={`fa-solid ${
              toast.type === "success"
                ? "fa-check-circle"
                : toast.type === "error"
                ? "fa-times-circle"
                : toast.type === "warning"
                ? "fa-exclamation-triangle"
                : "fa-info-circle"
            }`}
          />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default DiscussionModal;
