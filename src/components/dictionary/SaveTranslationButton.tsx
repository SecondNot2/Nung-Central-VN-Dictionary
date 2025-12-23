import React, { useState, useEffect } from "react";
import {
  isTranslationSaved,
  saveTranslation,
  deleteSavedTranslation,
} from "../../services/api/savedTranslationsService";
import { TranslationResult, User } from "../../types";

interface SaveTranslationButtonProps {
  user: User | null;
  originalText: string;
  sourceLang: string;
  targetLang: string;
  result: TranslationResult;
  onSaveSuccess?: () => void;
  onLoginRequired?: () => void;
}

const SaveTranslationButton: React.FC<SaveTranslationButtonProps> = ({
  user,
  originalText,
  sourceLang,
  targetLang,
  result,
  onSaveSuccess,
  onLoginRequired,
}) => {
  const [savedId, setSavedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if already saved when component mounts or user changes
  useEffect(() => {
    const checkSaved = async () => {
      if (!user) {
        setSavedId(null);
        setChecking(false);
        return;
      }

      setChecking(true);
      const id = await isTranslationSaved(user.id, originalText, targetLang);
      setSavedId(id);
      setChecking(false);
    };

    checkSaved();
  }, [user, originalText, targetLang]);

  const handleClick = async () => {
    // If not logged in, prompt login
    if (!user) {
      onLoginRequired?.();
      return;
    }

    setLoading(true);

    try {
      if (savedId) {
        // Unsave
        const success = await deleteSavedTranslation(savedId);
        if (success) {
          setSavedId(null);
        }
      } else {
        // Save
        const saved = await saveTranslation(
          user.id,
          originalText,
          sourceLang,
          targetLang,
          result
        );
        if (saved) {
          setSavedId(saved.id);
          onSaveSuccess?.();
        }
      }
    } catch (err) {
      console.error("Error toggling save:", err);
    } finally {
      setLoading(false);
    }
  };

  const isSaved = !!savedId;

  return (
    <button
      onClick={handleClick}
      disabled={loading || checking}
      className={`flex items-center gap-2 px-4 py-2 border-2 border-black transition-all shadow-brutal-sm active:translate-x-1 active:translate-y-1 active:shadow-none ${
        isSaved
          ? "bg-white text-nung-red"
          : "bg-white text-gray-400 group-hover:text-black"
      } ${
        loading || checking
          ? "opacity-50 cursor-wait shadow-none translate-x-1 translate-y-1"
          : "cursor-pointer"
      }`}
      title={isSaved ? "Bỏ lưu" : "Lưu bản dịch"}
    >
      {loading || checking ? (
        <i className="fa-solid fa-circle-notch fa-spin" />
      ) : (
        <i className={`fa-${isSaved ? "solid" : "regular"} fa-heart`} />
      )}
      <span className="text-sm font-black uppercase tracking-widest">
        {isSaved ? "Đã yêu" : "Yêu"}
      </span>
    </button>
  );
};

export default SaveTranslationButton;
