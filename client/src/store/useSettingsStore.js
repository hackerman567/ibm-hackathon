import { create } from 'zustand';

const getLocalStorage = (key, defaultValue) => {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return defaultValue;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  } catch (e) {
    return defaultValue;
  }
};

// Apply theme to <html> element
const applyTheme = (theme) => {
  const html = document.documentElement;
  if (theme === 'light') {
    html.classList.add('light');
    html.classList.remove('dark');
  } else {
    html.classList.remove('light');
    html.classList.add('dark');
  }
};

// Apply high contrast class to <html> element
const applyHighContrast = (isHighContrast) => {
  const html = document.documentElement;
  if (isHighContrast) {
    html.classList.add('high-contrast');
  } else {
    html.classList.remove('high-contrast');
  }
};

const savedTheme = getLocalStorage('signify-theme', 'dark');
const savedHighContrast = getLocalStorage('signify-high-contrast', false);
applyTheme(savedTheme);
applyHighContrast(savedHighContrast);

export const useSettingsStore = create((set) => ({
  targetLanguage: getLocalStorage('signify-target-lang', 'en'),
  autoTranslate: getLocalStorage('signify-auto-translate', false),
  autoSummarize: getLocalStorage('signify-auto-summarize', false),
  captionFontSize: getLocalStorage('signify-font-size', 'lg'),
  reduceMotion: getLocalStorage('signify-reduce-motion', false),
  groqApiKey: getLocalStorage('signify-groq-key', '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'),
  captionStyle: getLocalStorage('signify-caption-style', 'standard'),
  bgOpacity: Number(getLocalStorage('signify-bg-opacity', 20)),
  lineSpacing: getLocalStorage('signify-line-spacing', 'relaxed'),
  // New settings
  theme: getLocalStorage('signify-theme', 'dark'),
  notificationSounds: getLocalStorage('signify-notification-sounds', true),
  highContrast: getLocalStorage('signify-high-contrast', false),
  captionSpeed: getLocalStorage('signify-caption-speed', 'normal'), // slow | normal | fast

  actions: {
    setTargetLanguage: (lang) => {
      localStorage.setItem('signify-target-lang', lang);
      set({ targetLanguage: lang });
    },
    toggleAutoTranslate: () => set((state) => {
      const newVal = !state.autoTranslate;
      localStorage.setItem('signify-auto-translate', String(newVal));
      return { autoTranslate: newVal };
    }),
    toggleAutoSummarize: () => set((state) => {
      const newVal = !state.autoSummarize;
      localStorage.setItem('signify-auto-summarize', String(newVal));
      return { autoSummarize: newVal };
    }),
    setCaptionFontSize: (size) => {
      localStorage.setItem('signify-font-size', size);
      set({ captionFontSize: size });
    },
    toggleReduceMotion: () => set((state) => {
      const newVal = !state.reduceMotion;
      localStorage.setItem('signify-reduce-motion', String(newVal));
      return { reduceMotion: newVal };
    }),
    setApiKey: (key) => {
      localStorage.setItem('signify-groq-key', key);
      set({ groqApiKey: key });
    },
    setCaptionStyle: (style) => {
      localStorage.setItem('signify-caption-style', style);
      set({ captionStyle: style });
    },
    setBgOpacity: (opacity) => {
      localStorage.setItem('signify-bg-opacity', String(opacity));
      set({ bgOpacity: opacity });
    },
    setLineSpacing: (spacing) => {
      localStorage.setItem('signify-line-spacing', spacing);
      set({ lineSpacing: spacing });
    },
    toggleTheme: () => set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('signify-theme', newTheme);
      applyTheme(newTheme);
      return { theme: newTheme };
    }),
    toggleNotificationSounds: () => set((state) => {
      const newVal = !state.notificationSounds;
      localStorage.setItem('signify-notification-sounds', String(newVal));
      return { notificationSounds: newVal };
    }),
    toggleHighContrast: () => set((state) => {
      const newVal = !state.highContrast;
      localStorage.setItem('signify-high-contrast', String(newVal));
      applyHighContrast(newVal);
      return { highContrast: newVal };
    }),
    setCaptionSpeed: (speed) => {
      localStorage.setItem('signify-caption-speed', speed);
      set({ captionSpeed: speed });
    },
  }
}));
