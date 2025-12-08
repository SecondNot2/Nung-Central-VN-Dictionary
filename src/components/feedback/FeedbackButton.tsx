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
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-3 animate-fade-in">
            <div className="bg-earth-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
              Góp ý hoặc báo lỗi cho chúng tôi!
              <div className="absolute -bottom-1 right-6 w-2 h-2 bg-earth-900 rotate-45" />
            </div>
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleClick}
          className={`
            w-14 h-14 rounded-full
            bg-gradient-to-br from-bamboo-500 to-bamboo-600
            text-white shadow-lg
            hover:shadow-xl hover:scale-110
            active:scale-95
            transition-all duration-200
            flex items-center justify-center
            group
            ${!hasSeenButton ? "animate-pulse" : ""}
          `}
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
