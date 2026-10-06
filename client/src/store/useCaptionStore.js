import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export const useCaptionStore = create((set) => ({
  interimText: '',
  finalTranscript: [],
  translatedLines: [],
  isListening: false,
  sessionId: '',
  startTime: null,
  wordCount: 0,
  heatmapMarkers: [],

  actions: {
    addFinalLine: (text) => set((state) => {
      const cleanText = text.trim();
      if (!cleanText) return {};
      
      const newFinal = [...state.finalTranscript, cleanText];
      const newWords = cleanText.split(/\s+/).filter(Boolean).length;
      
      return {
        finalTranscript: newFinal,
        interimText: '',
        wordCount: state.wordCount + newWords
      };
    }),
    
    setInterimText: (text) => set({ interimText: text }),
    
    setTranslatedLine: (index, text) => set((state) => {
      const newTranslated = [...state.translatedLines];
      newTranslated[index] = text;
      return { translatedLines: newTranslated };
    }),

    addHeatmapMarker: (marker) => set((state) => ({
      heatmapMarkers: [...state.heatmapMarkers, marker]
    })),
    
    setSessionId: (id) => set({ sessionId: id }),

    startSession: () => set((state) => ({
      isListening: true,
      sessionId: state.sessionId || uuidv4(),
      startTime: new Date(),
      interimText: '',
      finalTranscript: [],
      translatedLines: [],
      wordCount: 0,
      heatmapMarkers: []
    })),
    
    stopSession: () => set({ isListening: false }),
    
    clearTranscript: () => set({
      interimText: '',
      finalTranscript: [],
      translatedLines: [],
      wordCount: 0,
      startTime: null,
      sessionId: '',
      heatmapMarkers: []
    }),
    
    incrementWordCount: (n) => set((state) => ({ wordCount: state.wordCount + n }))
  }
}));
