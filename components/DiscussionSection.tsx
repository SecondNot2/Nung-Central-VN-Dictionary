import React, { useState, useEffect } from "react";
import { generateTranslationKey } from "../services/discussionService";
import DiscussionModal from "./DiscussionModal";
import { User, TranslationResult } from "../types";
import { supabase, isSupabaseConfigured } from "../services/supabaseClient";

interface DiscussionSectionProps {
  originalText: string;
  targetLang: string;
  user: User | null;
  result: TranslationResult | null;
  onLoginRequired?: () => void;
}

const DiscussionSection: React.FC<DiscussionSectionProps> = ({
  originalText,
  targetLang,
  user,
  result,
  onLoginRequired,
}) => {
  const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const translationKey = generateTranslationKey(originalText, targetLang);

  // Fetch total count
  useEffect(() => {
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

    fetchTotalCount();
  }, [translationKey]);

  return (
    <>
      {/* Collapsed Discussion Bar */}
      <div className="mt-6 border-t border-earth-200 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-earth-700">
            <i className="fa-regular fa-comments text-bamboo-600" />
            <span className="font-medium">Thảo luận ({totalCount})</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm text-bamboo-600 hover:text-bamboo-700 font-medium transition-colors flex items-center gap-1"
          >
            Xem tất cả thảo luận
            <i className="fa-solid fa-chevron-right text-xs" />
          </button>
        </div>
      </div>

      {/* Discussion Modal */}
      <DiscussionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        originalText={originalText}
        targetLang={targetLang}
        user={user}
        result={result}
        onLoginRequired={onLoginRequired}
      />
    </>
  );
};

export default DiscussionSection;
