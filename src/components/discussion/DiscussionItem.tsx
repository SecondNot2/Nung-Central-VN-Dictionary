import React, { useState, useRef, useEffect } from "react";
import {
  Discussion,
  updateDiscussion,
} from "../../services/api/discussionService";
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
          {/* Avatar (Lite) */}
          <div
            className={`${avatarSize} border-2 border-black bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-brutal-sm`}
          >
            {discussion.user_avatar ? (
              <img
                src={discussion.user_avatar}
                alt={discussion.user_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <i
                className={`fa-solid fa-user text-black ${
                  depth === 1 ? "text-sm" : "text-xs"
                }`}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Comment Bubble (Lite) */}
            <div className="relative inline-block max-w-full">
              <div
                className={`border-2 border-black px-4 py-3 shadow-brutal-sm ${
                  depth === 1 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <span className="font-black uppercase tracking-tight text-xs block mb-1">
                  {discussion.user_name || "Ẩn danh"}
                </span>
                {isEditing ? (
                  <div className="mt-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 text-sm border-2 border-black outline-none bg-white resize-none"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={handleEdit}
                        disabled={submitting}
                        className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-black text-white border-2 border-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all shadow-brutal-sm disabled:opacity-50"
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
                        className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white text-black border-2 border-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all shadow-brutal-sm"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-black text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {discussion.content}
                  </p>
                )}
              </div>

              {/* 3-dot Menu (Lite) */}
              {user && !isEditing && (
                <div ref={menuRef} className="absolute -right-8 top-1">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="w-7 h-7 border-2 border-black bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100"
                  >
                    <i className="fa-solid fa-ellipsis text-black" />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 top-8 bg-white border-2 border-black shadow-brutal-sm py-1 min-w-[140px] z-10">
                      {isOwner && (
                        <>
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setShowMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest text-black hover:bg-gray-50 flex items-center gap-2"
                          >
                            <i className="fa-solid fa-pen" />
                            Chỉnh sửa
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(true);
                              setShowMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <i className="fa-solid fa-trash" />
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
                          className="w-full px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest text-black hover:bg-gray-50 flex items-center gap-2"
                        >
                          <i className="fa-solid fa-flag" />
                          Báo cáo
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions Row (Lite) */}
            {!isEditing && (
              <div className="flex items-center gap-4 mt-2 ml-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {formatTime(discussion.created_at)}
                </span>

                <button
                  onClick={() => onLike(discussion.id)}
                  disabled={!user || isLiking}
                  className={`text-[10px] font-black uppercase tracking-widest transition-all ${
                    discussion.is_liked_by_user
                      ? "text-nung-red"
                      : "text-gray-400 hover:text-black"
                  } ${
                    !user ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <i
                    className={`fa-solid fa-heart mr-1 ${
                      discussion.is_liked_by_user ? "scale-110" : "scale-100"
                    }`}
                  />
                  Thích
                  {discussion.like_count > 0 && ` (${discussion.like_count})`}
                </button>

                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  disabled={!user}
                  className={`text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all ${
                    !user ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <i className="fa-solid fa-reply mr-1" />
                  Trả lời
                </button>
              </div>
            )}

            {/* Reply Form (Lite) */}
            {showReplyForm && user && (
              <div className="flex gap-3 mt-4 ml-1">
                <div className="w-8 h-8 border-2 border-black flex items-center justify-center flex-shrink-0 bg-gray-100 shadow-brutal-sm">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="fa-solid fa-user text-black text-[10px]" />
                  )}
                </div>
                <div className="flex-1 flex items-center border-2 border-black bg-white px-3 py-2 shadow-brutal-sm">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && handleSubmitReply()
                    }
                    placeholder={`Trả lời ${discussion.user_name}...`}
                    className="flex-1 bg-transparent text-sm outline-none text-black placeholder-gray-400"
                  />
                  <button
                    onClick={handleSubmitReply}
                    disabled={!replyContent.trim() || submitting}
                    className="ml-2 text-black hover:text-nung-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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

      {/* Delete/Report Dialogs (Lite) */}
      {(showDeleteConfirm || showReportConfirm) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowDeleteConfirm(false);
              setShowReportConfirm(false);
            }}
          />
          <div className="relative bg-white border-2 border-black shadow-brutal p-8 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black uppercase tracking-tight text-black mb-3">
              {showDeleteConfirm ? "Xóa bình luận?" : "Báo cáo bình luận?"}
            </h3>
            <p className="text-black text-sm italic mb-6 leading-relaxed">
              {showDeleteConfirm
                ? "Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác."
                : "Bạn muốn báo cáo bình luận này vi phạm quy định cộng đồng?"}
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setShowReportConfirm(false);
                }}
                className="px-6 py-2 border-2 border-black font-black uppercase text-[10px] tracking-widest bg-white text-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all shadow-brutal-sm"
              >
                Hủy
              </button>
              <button
                onClick={showDeleteConfirm ? handleDelete : handleReport}
                disabled={isDeleting}
                className={`px-6 py-2 border-2 border-black font-black uppercase text-[10px] tracking-widest text-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all shadow-brutal-sm flex items-center gap-2 ${
                  showDeleteConfirm ? "bg-nung-red" : "bg-black"
                }`}
              >
                {isDeleting && (
                  <i className="fa-solid fa-circle-notch fa-spin" />
                )}
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DiscussionItem;
