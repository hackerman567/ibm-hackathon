import { create } from 'zustand';

export const useLectureStore = create((set) => ({
  currentSummary: null,
  keyPoints: [],
  examQuestions: [],
  isSummarizing: false,
  chatHistory: [], // elements format: { role: 'user'|'assistant', content: string }
  isAiTyping: false,
  currentImportance: null,

  actions: {
    setSummary: (data) => set({
      currentSummary: data.summary || '',
      keyPoints: data.keyPoints || [],
      examQuestions: data.examQuestions || []
    }),
    
    addChatMessage: (msg) => set((state) => ({
      chatHistory: [...state.chatHistory, msg]
    })),
    
    clearSummary: () => set({
      currentSummary: null,
      keyPoints: [],
      examQuestions: [],
      chatHistory: []
    }),
    
    setIsSummarizing: (bool) => set({ isSummarizing: bool }),
    setIsAiTyping: (bool) => set({ isAiTyping: bool }),
    setChatHistory: (history) => set({ chatHistory: history }),
    setCurrentImportance: (data) => set({ currentImportance: data })
  }
}));
