import React, { useState, useEffect } from "react";
import FeedbackModal from "./FeedbackModal";
import { User } from "../../types";

interface FeedbackButtonProps {
  user: User | null;
}

const FeedbackButton: React.FC<FeedbackButtonProps> = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasSeenButton, setHasSeenButton] = useState(false);

  useEffect(() => {
    // Check if user has seen the feedback button before
    const seen = localStorage.getItem("feedback_button_seen");
    if (!seen) {
      setShowTooltip(true);
      // Hide tooltip after 5 seconds
      const timer = setTimeout(() => {
        setShowTooltip(false);
        localStorage.setItem("feedback_button_seen", "true");
        setHasSeenButton(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setHasSeenButton(true);
    }
  }, []);

  const handleClick = () => {
    setShowTooltip(false);
    localStorage.setItem("feedback_button_seen", "true");
    setHasSeenButton(true);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Floating Action Button (Brutalist Lite) */}
      <div className="fixed bottom-6 right-6 z-40">
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white border-2 border-black px-4 py-2 shadow-brutal-sm whitespace-nowrap">
              <p className="text-[10px] font-black uppercase tracking-widest text-black">
                Góp ý & Báo lỗi
              </p>
              <div className="absolute -bottom-1 right-6 w-2 h-2 bg-white border-b-2 border-r-2 border-black rotate-45" />
            </div>
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleClick}
          className="w-14 h-14 bg-black text-white border-2 border-white shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center group"
          title="Góp ý & Báo lỗi"
        >
          <i className="fa-solid fa-comment-dots text-xl group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
      />
    </>
  );
};

export default FeedbackButton;
