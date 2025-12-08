import React, { useState, useRef, useEffect } from "react";
import { Discussion, updateDiscussion } from "../../services/api/discussionService";
import { User } from "../../types";

interface DiscussionItemProps {
  discussion: Discussion;
  user: User | null;
  onLike: (discussionId: string) => void;
  onReply: (discussionId: string, content: string) => void;
  onDelete: (discussionId: string) => Promise<void>;
  onReport?: (discussionId: string) => void;
  onToast?: (
    message: string,
    type: "success" | "error" | "warning" | "info"
  ) => void;
  isLiking?: boolean;
  depth?: number;
}

const DiscussionItem: React.FC<DiscussionItemProps> = ({
  discussion,
  user,
  onLike,
  onReply,
  onDelete,
  onReport,
  onToast,
  isLiking,
  depth = 1,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(discussion.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = user && discussion.user_id === user.id;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIndentClass = () => {
    if (depth === 1) return "";
    if (depth === 2) return "ml-10";
    return "ml-20";
  };

  const indentClass = getIndentClass();
  const avatarSize = depth === 1 ? "w-10 h-10" : "w-8 h-8";

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;
    return date.toLocaleDateString("vi-VN");
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    await onReply(discussion.id, replyContent);
    setReplyContent("");
    setShowReplyForm(false);
    setSubmitting(false);
    onToast?.("Đã gửi phản hồi", "success");
  };

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === discussion.content) {
      setIsEditing(false);
      return;
    }
    setSubmitting(true);
    const success = await updateDiscussion(discussion.id, editContent);
    if (success) {
      discussion.content = editContent;
      onToast?.("Đã cập nhật bình luận", "success");
    } else {
      onToast?.("Không thể cập nhật bình luận", "error");
    }
    setSubmitting(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(discussion.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    onToast?.("Đã xóa bình luận", "success");
  };

  const handleReport = () => {
    onReport?.(discussion.id);
    setShowReportConfirm(false);
    onToast?.("Đã báo cáo bình luận", "info");
  };

  return (
    <>
      <div className={`${indentClass} ${depth > 1 ? "mt-2" : ""}`}>
        <div className="flex gap-2 group">
          {/* Avatar */}
          <div
            className={`${avatarSize} rounded-full bg-gradient-to-br from-bamboo-400 to-bamboo-600 flex items-center justify-center flex-shrink-0 overflow-hidden`}
          >
            {discussion.user_avatar ? (
              <img
                src={discussion.user_avatar}
                alt={discussion.user_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <i
                className={`fa-solid fa-user text-white ${
                  depth === 1 ? "text-sm" : "text-xs"
                }`}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Comment Bubble */}
            <div className="relative inline-block max-w-full">
              <div className="bg-earth-100 rounded-2xl px-3 py-2">
                <span className="font-semibold text-earth-900 text-sm block">
                  {discussion.user_name || "Người dùng ẩn danh"}
                </span>
                {isEditing ? (
                  <div className="mt-1">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 text-sm border border-earth-200 rounded-lg outline-none focus:ring-2 focus:ring-bamboo-500 resize-none"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleEdit}
                        disabled={submitting}
                        className="px-3 py-1 text-xs bg-bamboo-600 text-white rounded-full hover:bg-bamboo-700 disabled:opacity-50"
                      >
                        {submitting ? (
                          <i className="fa-solid fa-circle-notch fa-spin" />
                        ) : (
                          "Lưu"
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditContent(discussion.content);
                        }}
                        className="px-3 py-1 text-xs bg-earth-200 text-earth-700 rounded-full hover:bg-earth-300"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-earth-800 text-sm whitespace-pre-wrap break-words">
                    {discussion.content}
                  </p>
                )}
              </div>

              {/* 3-dot Menu */}
              {user && !isEditing && (
                <div ref={menuRef} className="absolute -right-8 top-1">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="w-7 h-7 rounded-full hover:bg-earth-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <i className="fa-solid fa-ellipsis text-earth-500" />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-earth-200 py-1 min-w-[140px] z-10">
                      {isOwner && (
                        <>
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setShowMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-earth-700 hover:bg-earth-50 flex items-center gap-2"
                          >
                            <i className="fa-solid fa-pen text-earth-400" />
                            Chỉnh sửa
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(true);
                              setShowMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <i className="fa-solid fa-trash text-red-400" />
                            Xóa
                          </button>
                        </>
                      )}
                      {!isOwner && (
                        <button
                          onClick={() => {
                            setShowReportConfirm(true);
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-earth-700 hover:bg-earth-50 flex items-center gap-2"
                        >
                          <i className="fa-solid fa-flag text-earth-400" />
                          Báo cáo
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions Row */}
            {!isEditing && (
              <div className="flex items-center gap-3 mt-1 ml-2 text-xs">
                <span className="text-earth-400">
                  {formatTime(discussion.created_at)}
                </span>

                <button
                  onClick={() => onLike(discussion.id)}
                  disabled={!user || isLiking}
                  className={`font-semibold transition-colors ${
                    discussion.is_liked_by_user
                      ? "text-bamboo-600"
                      : "text-earth-500 hover:text-bamboo-600"
                  } ${
                    !user ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  Thích
                  {discussion.like_count > 0 && ` (${discussion.like_count})`}
                </button>

                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  disabled={!user}
                  className={`font-semibold text-earth-500 hover:text-bamboo-600 transition-colors ${
                    !user ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  Trả lời
                </button>
              </div>
            )}

            {/* Reply Form */}
            {showReplyForm && user && (
              <div className="flex gap-2 mt-2 ml-2">
                <div className="w-6 h-6 rounded-full bg-bamboo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="fa-solid fa-user text-bamboo-500 text-xs" />
                  )}
                </div>
                <div className="flex-1 flex items-center bg-earth-100 rounded-full px-3 py-1.5">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && handleSubmitReply()
                    }
                    placeholder={`Trả lời ${discussion.user_name}...`}
                    className="flex-1 bg-transparent text-sm outline-none text-earth-800 placeholder-earth-400"
                  />
                  <button
                    onClick={handleSubmitReply}
                    disabled={!replyContent.trim() || submitting}
                    className="ml-2 text-bamboo-600 hover:text-bamboo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <i className="fa-solid fa-circle-notch fa-spin" />
                    ) : (
                      <i className="fa-solid fa-paper-plane" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Render nested replies */}
        {discussion.replies && discussion.replies.length > 0 && (
          <div className="mt-2">
            {discussion.replies.map((reply) => (
              <DiscussionItem
                key={reply.id}
                discussion={reply}
                user={user}
                onLike={onLike}
                onReply={onReply}
                onDelete={onDelete}
                onReport={onReport}
                onToast={onToast}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirm Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-earth-900 mb-2">
              Xóa bình luận?
            </h3>
            <p className="text-earth-600 text-sm mb-4">
              Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể
              hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-earth-600 hover:bg-earth-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && (
                  <i className="fa-solid fa-circle-notch fa-spin" />
                )}
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Confirm Dialog */}
      {showReportConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowReportConfirm(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-earth-900 mb-2">
              Báo cáo bình luận?
            </h3>
            <p className="text-earth-600 text-sm mb-4">
              Bạn muốn báo cáo bình luận này vi phạm quy định cộng đồng?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowReportConfirm(false)}
                className="px-4 py-2 text-sm text-earth-600 hover:bg-earth-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleReport}
                className="px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                Báo cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DiscussionItem;
