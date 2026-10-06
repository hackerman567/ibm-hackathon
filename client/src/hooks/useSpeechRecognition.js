import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useCaptionStore } from '../store/useCaptionStore';
import { useLectureStore } from '../store/useLectureStore';
import { dispatchCaptionFinalized } from '../addons';
import { socket } from '../services/socket';

const SAMPLE_LECTURE_TEXT =
  "Welcome class. Today we are going to study React components and how we manage local state using hooks. " +
  "A component is essentially a JavaScript function that returns user interface elements. " +
  "When you want to store information that changes over the course of a session, you use the useState hook. " +
  "Managing state correctly is essential to building highly interactive and accessible web applications. " +
  "Let's make sure our application respects keyboard focus and is compatible with screen readers. " +
  "This is vital for achieving WCAG 2.1 accessibility compliance. " +
  "Next, we will cover the useEffect hook which allows us to trigger side effects such as fetching data from a server. " +
  "When writing state variables, remember that updating state causes the component to re-render. " +
  "We must avoid unnecessary renders to maintain fast, smooth performances in our web apps. " +
  "Now let's open our text editors and begin coding this interactive dashboard step by step.";

export function useSpeechRecognition() {
  const { isListening, actions } = useCaptionStore();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const recognitionRef = useRef(null);
  const demoIntervalRef = useRef(null);
  const demoIndexRef = useRef(0);
  const currentSentenceRef = useRef([]);

  // Heatmap tracking refs
  const lastAnalyzedWordCount = useRef(0);
  const sessionTimerRef = useRef(null);
  const demoMarkersInjected = useRef(new Set());
  const lastFiredSecond = useRef(-1);

  // Keep latest values in refs to avoid stale closures
  const isListeningRef = useRef(false);
  const isDemoModeRef = useRef(false);
  const shouldRestartRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API is not supported in this browser.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => {
      console.log('Speech recognition started');
    };

    rec.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) {
        actions.setInterimText(interim);
        if (socket.connected) {
          socket.emit('caption-interim', {
            sessionId: useCaptionStore.getState().sessionId,
            text: interim
          });
        }
      }

      if (final) {
        actions.addFinalLine(final);
        if (socket.connected) {
          socket.emit('caption-final', {
            sessionId: useCaptionStore.getState().sessionId,
            line: final
          });
        }
        // Non-blocking add-on caption hook
        try {
          dispatchCaptionFinalized({
            text: final,
            timestamp: Date.now(),
            sessionId: useCaptionStore.getState().sessionId
          });
        } catch (e) {
          // Fail silently
        }
      }
    };

    rec.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please check site permissions.');
        actions.stopSession();
      } else if (event.error === 'no-speech') {
        // Safe to ignore, we want to keep listening
      } else {
        toast.error(`Microphone error: ${event.error}`);
      }
    };

    rec.onend = () => {
      console.log('Speech recognition ended');
      // Use refs to avoid stale closure values
      if (shouldRestartRef.current && isListeningRef.current && !isDemoModeRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.error('Failed to restart speech recognition:', err);
        }
      }
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [actions]);

  // Keep refs in sync with latest state values
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isDemoModeRef.current = isDemoMode;
  }, [isDemoMode]);

  // Sync listening state with speech recognition or demo mode
  useEffect(() => {
    shouldRestartRef.current = isListening;

    if (isListening) {
      if (isDemoMode) {
        startDemoSimulation();
      } else {
        stopDemoSimulation();
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (err) {
            console.error('Error starting SpeechRecognition:', err);
          }
        } else {
          toast.error('Web Speech API not supported in this browser. Try Demo mode instead!');
          actions.stopSession();
        }
      }
    } else {
      if (isDemoMode) {
        stopDemoSimulation();
      } else if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }

    return () => {
      stopDemoSimulation();
    };
  }, [isListening, isDemoMode]);

  // Heatmap and Demo Marker Injection logic
  useEffect(() => {
    if (!isListening) {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
      lastAnalyzedWordCount.current = 0;
      lastFiredSecond.current = -1;
      demoMarkersInjected.current = new Set();
      return;
    }

    const startTime = Date.now();

    sessionTimerRef.current = setInterval(async () => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const state = useCaptionStore.getState();
      const lectureState = useLectureStore.getState();

      if (isDemoMode) {
        // Inject demo markers
        const inject = (timestamp, markerObj) => {
          if (!demoMarkersInjected.current.has(timestamp) && elapsedSeconds >= timestamp) {
            demoMarkersInjected.current.add(timestamp);
            setTimeout(() => {
              const newMarker = {
                id: Math.random().toString(),
                ...markerObj,
                timestamp: elapsedSeconds,
                transcriptIndex: state.finalTranscript.length
              };
              state.actions.addHeatmapMarker(newMarker);
              lectureState.actions.setCurrentImportance(newMarker);
            }, 200); // realistic delay
          }
        };

        inject(15, { type: 'concept', importance: 'high', label: 'Photosynthesis definition', reason: 'Core concept introduced' });
        inject(35, { type: 'exam', importance: 'high', label: 'Will appear in exam', reason: 'Teacher explicitly mentioned exam' });
        inject(55, { type: 'formula', importance: 'high', label: 'Chlorophyll equation', reason: 'Mathematical formula stated' });
        inject(75, { type: 'example', importance: 'medium', label: 'Real world analogy given', reason: 'Teacher used solar panel analogy' });
        inject(95, { type: 'exam', importance: 'high', label: 'Important derivation step', reason: 'Step-by-step formula derivation' });
        return;
      }

      // Real API logic: trigger every 20 seconds, deduplicated by lastFiredSecond ref
      if (elapsedSeconds > 0 && elapsedSeconds % 20 === 0 && lastFiredSecond.current !== elapsedSeconds) {
        lastFiredSecond.current = elapsedSeconds;
        const currentWordCount = state.wordCount;
        if (currentWordCount - lastAnalyzedWordCount.current >= 30) {
          lastAnalyzedWordCount.current = currentWordCount;

          const transcriptWords = state.finalTranscript.join(' ').split(' ');
          const chunk = transcriptWords.slice(-200).join(' '); // last 200 words

          try {
            const res = await fetch('/api/groq/analyze-chunk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chunk, timestamp: elapsedSeconds, sessionId: state.sessionId })
            });
            const data = await res.json();

            const newMarker = {
              id: Math.random().toString(),
              ...data,
              timestamp: elapsedSeconds,
              transcriptIndex: state.finalTranscript.length
            };

            if (!(data.type === 'normal' && data.importance === 'low')) {
              state.actions.addHeatmapMarker(newMarker);
            }
            lectureState.actions.setCurrentImportance(newMarker);
          } catch (e) {
            console.error('Heatmap analysis failed:', e);
          }
        }
      }
    }, 1000); // run check every second

    return () => clearInterval(sessionTimerRef.current);
  }, [isListening, isDemoMode]);

  // Demo simulation function
  const startDemoSimulation = () => {
    stopDemoSimulation(); // Clean up any existing intervals
    actions.clearTranscript();
    demoIndexRef.current = 0;
    currentSentenceRef.current = [];

    const words = SAMPLE_LECTURE_TEXT.split(' ');

    demoIntervalRef.current = setInterval(() => {
      if (demoIndexRef.current >= words.length) {
        // Restart demo from beginning
        demoIndexRef.current = 0;
      }

      const word = words[demoIndexRef.current];
      currentSentenceRef.current.push(word);
      demoIndexRef.current++;

      // Create interim text preview
      const interimText = currentSentenceRef.current.join(' ');
      actions.setInterimText(interimText);
      if (socket.connected) {
        socket.emit('caption-interim', {
          sessionId: useCaptionStore.getState().sessionId,
          text: interimText
        });
      }

      // If word ends with a period, question mark, or exclamation, commit sentence
      if (word.endsWith('.') || word.endsWith('?') || word.endsWith('!')) {
        const sentence = currentSentenceRef.current.join(' ');
        actions.addFinalLine(sentence);
        if (socket.connected) {
          socket.emit('caption-final', {
            sessionId: useCaptionStore.getState().sessionId,
            line: sentence
          });
        }
        try {
          dispatchCaptionFinalized({
            text: sentence,
            timestamp: Date.now(),
            sessionId: useCaptionStore.getState().sessionId
          });
        } catch (e) { }
        currentSentenceRef.current = [];
      }
    }, 280); // Roughly 200 words per minute
  };

  const stopDemoSimulation = () => {
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
  };

  const toggleDemo = () => {
    if (!isListening) {
      setIsDemoMode(true);
      actions.startSession();
    } else {
      actions.stopSession();
      setIsDemoMode(false);
    }
  };

  const toggleListening = () => {
    if (isDemoMode) {
      setIsDemoMode(false);
    }
    if (isListening) {
      actions.stopSession();
    } else {
      actions.startSession();
    }
  };

  return {
    isListening,
    isDemoMode,
    toggleListening,
    toggleDemo,
    supported: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  };
}
