// MyMemory translation API integration

// Translation Cache to prevent redundant API calls
const translationCache = new Map();

// Supported languages list with flag emojis
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English (Default)', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
  { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
  { code: 'et', name: 'Estonian', flag: '🇪🇪' },
  { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'fa', name: 'Persian', flag: '🇮🇷' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'ca', name: 'Catalan', flag: '🇪🇸' },
  { code: 'gl', name: 'Galician', flag: '🇪🇸' },
  { code: 'eu', name: 'Basque', flag: '🇪🇸' }
];

/**
 * Translates English text to a target language code using MyMemory free API.
 * Uses a caching layer to avoid duplicate requests.
 * @param {string} text - Text to translate.
 * @param {string} targetLang - Two-letter ISO language code (e.g. 'es', 'fr').
 * @returns {Promise<string>} - The translated string.
 */
export async function translateText(text, targetLang) {
  if (!text || !text.trim()) return '';
  if (targetLang === 'en') return text; // Already English

  const cacheKey = `${targetLang}:${text.trim()}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    const cleanText = encodeURIComponent(text.trim());
    const url = `https://api.mymemory.translated.net/get?q=${cleanText}&langpair=en|${targetLang}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`MyMemory API response was not OK: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.responseData && data.responseData.translatedText) {
      const result = data.responseData.translatedText;
      translationCache.set(cacheKey, result);
      return result;
    } else {
      console.warn('MyMemory Response format invalid or empty:', data);
      return text; // Fallback to source
    }
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to source on error
  }
}
