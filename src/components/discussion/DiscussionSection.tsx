import React, { useState, useEffect } from "react";
import { generateTranslationKey } from "../../services/api/discussionService";
import DiscussionModal from "./DiscussionModal";
import { User, TranslationResult } from "../../types";
import {
  supabase,
  isSupabaseConfigured,
} from "../../services/api/supabaseClient";

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
      {/* Collapsed Discussion Bar (Lite) */}
      <div className="mt-8 border-t-2 border-black pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black text-white border-2 border-black flex items-center justify-center shadow-brutal-sm">
              <i className="fa-regular fa-comments" />
            </div>
            <div>
              <span className="font-black uppercase tracking-tight text-lg">
                Thảo luận
              </span>
              <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                ({totalCount})
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 border-2 border-black font-black uppercase text-[10px] tracking-widest hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all shadow-brutal-sm flex items-center gap-2"
          >
            Mở thảo luận
            <i className="fa-solid fa-arrow-up-right-from-square" />
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
