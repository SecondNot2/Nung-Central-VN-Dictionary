import React, { useState, useEffect } from "react";
import {
  isTranslationSaved,
  saveTranslation,
  deleteSavedTranslation,
} from "../services/savedTranslationsService";
import { TranslationResult, User } from "../types";

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
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
        isSaved
          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
          : "bg-earth-100 text-earth-600 hover:bg-earth-200"
      } ${loading || checking ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
      title={isSaved ? "Bỏ lưu" : "Lưu bản dịch"}
    >
      {loading || checking ? (
        <i className="fa-solid fa-circle-notch fa-spin" />
      ) : (
        <i className={`fa-${isSaved ? "solid" : "regular"} fa-bookmark`} />
      )}
      <span className="text-sm font-medium">{isSaved ? "Đã lưu" : "Lưu"}</span>
    </button>
  );
};

export default SaveTranslationButton;
