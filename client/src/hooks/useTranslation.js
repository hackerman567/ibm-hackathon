import { useState, useCallback } from 'react';
import { translateText } from '../lib/translate';
import { useCaptionStore } from '../store/useCaptionStore';
import { useSettingsStore } from '../store/useSettingsStore';

export function useTranslation() {
  const { actions } = useCaptionStore();
  const { targetLanguage, autoTranslate } = useSettingsStore();
  const [isTranslating, setIsTranslating] = useState(false);

  const translateLine = useCallback(async (text, index) => {
    if (!text || !text.trim() || !autoTranslate || targetLanguage === 'en') {
      return;
    }

    setIsTranslating(true);
    try {
      const translated = await translateText(text, targetLanguage);
      actions.setTranslatedLine(index, translated);
    } catch (err) {
      console.error('Translation hook failed:', err);
    } finally {
      setIsTranslating(false);
    }
  }, [actions, targetLanguage, autoTranslate]);

  return {
    translateLine,
    isTranslating,
    targetLanguage
  };
}
