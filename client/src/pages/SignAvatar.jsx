import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Volume2, Shield, Settings, Sliders, Play, Pause, RotateCcw,
  Sparkles, CheckCircle2, Languages, Activity, Eye, Accessibility,
  ChevronRight, ZoomIn, ZoomOut, Contrast, Gauge, Send,
  Layers, Cpu, BookOpen, Repeat
} from 'lucide-react';
import AvatarScene from '../components/avatar/AvatarScene';
import MediaPipeSkeletonViewer from '../components/avatar/MediaPipeSkeletonViewer';
import RyloAvatarViewer from '../components/avatar/RyloAvatarViewer';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';

// Target Sign Languages supported
const SIGN_LANGUAGES = [
  { code: 'ASL', name: 'American Sign Language (ASL)', flag: '🇺🇸' },
  { code: 'ISL', name: 'Indian Sign Language (ISL)', flag: '🇮🇳' },
  { code: 'BSL', name: 'British Sign Language (BSL)', flag: '🇬🇧' },
  { code: 'IS', name: 'International Sign (IS)', flag: '🌐' }
];

// Spoken Source Languages supported
const SPOKEN_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ta', name: 'Tamil (தமிழ்)', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'hi', name: 'Hindi (हिंदी)', flag: '🇮🇳' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷' }
];

// Sample phrases for quick translation testing
const SAMPLE_PHRASES = [
  "Good morning students.",
  "Photosynthesis converts sunlight into energy.",
  "Water and carbon dioxide are essential for plants.",
  "Where is the chemistry laboratory?"
];

export default function SignAvatar() {
  // Translation state
  const [spokenLang, setSpokenLang] = useState('en');
  const [targetSignLang, setTargetSignLang] = useState('ASL');
  const [inputText, setInputText] = useState('');
  const [activeSentence, setActiveSentence] = useState('');
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [signTokens, setSignTokens] = useState([]);

  // Player controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signingSpeed, setSigningSpeed] = useState(1.0);
  const [avatarScale, setAvatarScale] = useState(1.0);
  const [viewMode, setViewMode] = useState('mediapipe'); // 'mediapipe' default full-frame Sign Language Stickman Engine
  const [isLooping, setIsLooping] = useState(false);
  const [confidence, setConfidence] = useState(98.6);
  
  // Speech & Demo state
  const [isListening, setIsListening] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const recognitionRef = useRef(null);
  const playbackTimerRef = useRef(null);
  const wordTimerRef = useRef(null);

  // Setup Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = spokenLang === 'ta' ? 'ta-IN' : spokenLang === 'es' ? 'es-ES' : 'en-US';

    rec.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      if (final || interim) {
        const text = (final || interim).trim();
        setInputText(text);
        if (final) {
          triggerSignTranslation(text);
        }
      }
    };

    rec.onend = () => {
      if (isListening && !isDemoMode) {
        try { rec.start(); } catch (_) {}
      }
    };

    recognitionRef.current = rec;
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [isListening, isDemoMode, spokenLang]);

  // Core function: Translate text to sign sequence & start player
  const triggerSignTranslation = (textToTranslate) => {
    const text = (textToTranslate || inputText).trim();
    if (!text) {
      toast.error('Please enter text or start speech input first');
      return;
    }

    setActiveSentence(text);
    const words = text.split(/\s+/).filter(Boolean);
    const tokens = words.map((w, idx) => ({
      id: idx,
      word: w.toUpperCase().replace(/[^A-Z]/g, ''),
      original: w,
      symbol: `[${w.toUpperCase().replace(/[^A-Z]/g, '')}]`
    }));

    setSignTokens(tokens);
    setIsPlaying(true);
    setIsSigning(true);
    setActiveWordIndex(0);
    setConfidence(parseFloat((97 + Math.random() * 2.8).toFixed(1)));

    // Playback loop stepping word by word
    if (wordTimerRef.current) clearInterval(wordTimerRef.current);
    let currentIdx = 0;
    const intervalMs = Math.max(600, 1200 / signingSpeed);

    wordTimerRef.current = setInterval(() => {
      if (currentIdx < words.length) {
        setActiveWordIndex(currentIdx);
        currentIdx++;
      } else {
        if (isLooping) {
          currentIdx = 0;
          setActiveWordIndex(0);
        } else {
          clearInterval(wordTimerRef.current);
          setIsSigning(false);
          setIsPlaying(false);
        }
      }
    }, intervalMs);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsSigning(false);
    setActiveWordIndex(-1);
    if (wordTimerRef.current) clearInterval(wordTimerRef.current);
  };

  const toggleMic = () => {
    if (isListening) {
      setIsListening(false);
      if (recognitionRef.current) recognitionRef.current.stop();
      toast.success('Microphone stopped');
    } else {
      setIsListening(true);
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (_) {}
      }
      toast.success('Listening for live speech...');
    }
  };

  // Preset phrase click
  const selectPreset = (phrase) => {
    setInputText(phrase);
    triggerSignTranslation(phrase);
  };

  useEffect(() => {
    return () => {
      if (wordTimerRef.current) clearInterval(wordTimerRef.current);
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-bg-base p-4 md:p-8 flex flex-col justify-between select-none">
      
      {/* 1. Header & Rylo Language Pair Switcher */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-accent-coral bg-accent-coral/10 border border-accent-coral/20 uppercase rounded-full">
                Rylo-Powered Engine
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-accent-blue-soft bg-accent-blue/10 border border-accent-blue/20 uppercase rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Real-time Sign MT
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary font-display mt-2">
              Sign Language Translator
            </h1>
            <p className="text-text-secondary text-xs">
              Translate spoken classroom text into continuous sign language gestures in real-time.
            </p>
          </div>

        </div>

        {/* Rylo-style Language Bar */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-3 flex flex-wrap items-center justify-between gap-4">
          {/* Spoken Language Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-text-secondary tracking-wider">Spoken Input:</span>
            <select
              value={spokenLang}
              onChange={(e) => setSpokenLang(e.target.value)}
              className="bg-bg-elevated border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-coral cursor-pointer"
            >
              {SPOKEN_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
              ))}
            </select>
          </div>

          {/* Target Sign Language Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-text-secondary tracking-wider">Target Sign Language:</span>
            <div className="flex gap-1">
              {SIGN_LANGUAGES.map((sl) => (
                <button
                  key={sl.code}
                  onClick={() => setTargetSignLang(sl.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                    targetSignLang === sl.code
                      ? 'bg-accent-coral/15 text-accent-coral border-accent-coral/30'
                      : 'bg-bg-elevated text-text-secondary border-border-subtle hover:text-text-primary'
                  }`}
                >
                  <span>{sl.flag}</span>
                  <span>{sl.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Rylo Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* LEFT COLUMN (5 cols): Input Card & Sample Presets */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          {/* Main Translation Text Box */}
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-4 shadow-lg flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                <span className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                  <Languages className="w-4 h-4 text-accent-coral" /> Spoken Text Input
                </span>
                <span className="text-[10px] text-text-muted">{inputText.length} characters</span>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or paste lecture text here (e.g. 'Photosynthesis converts sunlight into energy')..."
                className="w-full h-36 bg-bg-elevated border border-border-subtle hover:border-accent-coral/20 focus:border-accent-coral focus:ring-1 focus:ring-accent-coral/30 rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none resize-none transition-colors"
              />

              {/* Active Sentence & Word-by-Word Highlight Display */}
              {activeSentence && (
                <div className="bg-black/20 p-3 rounded-lg border border-border-subtle space-y-1">
                  <span className="text-[9px] uppercase font-bold text-accent-coral tracking-wider">Active Sign Playback Transcript</span>
                  <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                    {activeSentence.split(/\s+/).map((w, idx) => (
                      <span
                        key={idx}
                        className={`px-1.5 py-0.5 rounded transition-all ${
                          idx === activeWordIndex
                            ? 'bg-accent-coral text-bg-base font-bold scale-110 shadow'
                            : 'text-text-secondary bg-bg-elevated'
                        }`}
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-3 pt-3 border-t border-border-subtle">
              <Button
                onClick={() => triggerSignTranslation()}
                variant="primary"
                className="flex-1"
                icon={Send}
              >
                Translate to Sign
              </Button>

              <button
                onClick={toggleMic}
                className={`p-2.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isListening
                    ? 'bg-red-500/15 text-red-400 border-red-500/30'
                    : 'bg-bg-elevated text-text-secondary border-border-subtle hover:text-text-primary'
                }`}
                title="Voice Input Mic"
              >
                {isListening ? <Mic className="w-4 h-4 text-red-500" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => { setInputText(''); handleStop(); }}
                className="p-2.5 rounded-lg bg-bg-elevated hover:bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary text-xs font-bold"
                title="Clear input"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Sample Phrases Preset Library */}
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
              Quick Test Phrases (Click to Sign)
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => selectPreset(phrase)}
                  className="px-3 py-1.5 rounded-lg bg-bg-elevated hover:bg-accent-coral/10 hover:border-accent-coral/30 border border-border-subtle text-xs text-text-secondary hover:text-accent-coral font-medium transition-colors text-left"
                >
                  "{phrase}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (7 cols): Rylo Sign Viewer & Player Controls */}
        <div className="lg:col-span-7 bg-bg-surface border border-border-subtle rounded-xl p-6 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
          
          {/* Top Viewer Controls: Mode Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-4 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-coral" />
              <span className="font-bold text-text-primary text-sm font-display uppercase tracking-wider">
                {targetSignLang} Visual Output
              </span>
            </div>

            {/* Rylo View Modes: Rylo Web Avatar | MediaPipe Stickman | 3D Avatar | AI Skeleton */}
            <div className="flex gap-1 bg-bg-elevated p-1 rounded-lg border border-border-subtle">
              <button
                onClick={() => setViewMode('rylo')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  viewMode === 'rylo'
                    ? 'bg-accent-coral text-bg-base shadow'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Rylo Avatar
              </button>
              <button
                onClick={() => setViewMode('mediapipe')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  viewMode === 'mediapipe'
                    ? 'bg-accent-coral text-bg-base shadow'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                MediaPipe Stickman
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  viewMode === '3d'
                    ? 'bg-accent-coral text-bg-base shadow'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                3D Canvas
              </button>
              <button
                onClick={() => setViewMode('skeleton')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  viewMode === 'skeleton'
                    ? 'bg-accent-coral text-bg-base shadow'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                AI Skeleton
              </button>
            </div>
          </div>

          {/* Viewport Canvas (Sign Language Stickman & Avatar Engine) */}
          <div className="flex-1 min-h-[420px] rounded-xl overflow-hidden relative border border-border-subtle/50 bg-black/40">
            {viewMode === 'rylo' ? (
              <RyloAvatarViewer
                isSigning={isSigning}
                currentWord={signTokens[activeWordIndex]?.word || ''}
                textToSign={inputText || activeSentence}
                targetSignLang={targetSignLang}
              />
            ) : viewMode === 'mediapipe' ? (
              <MediaPipeSkeletonViewer
                isSigning={isSigning}
                speed={signingSpeed}
                currentWord={signTokens[activeWordIndex]?.word || ''}
              />
            ) : (
              <AvatarScene
                isSigning={isSigning}
                speed={signingSpeed}
                currentWord={signTokens[activeWordIndex]?.word || ''}
                viewMode={viewMode}
              />
            )}

            {/* Overlay Active Word Badge */}
            <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
              <div className="bg-bg-surface/85 backdrop-blur-md px-3.5 py-2 rounded-lg border border-border-subtle shadow-xl">
                <span className="text-[9px] font-bold uppercase tracking-wider text-accent-coral block">Active Gesture</span>
                <span className="text-base font-bold text-text-primary font-display">
                  {signTokens[activeWordIndex]?.symbol || (isSigning ? '[SIGNING...]' : '[READY]')}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Player Controls & Speed Slider */}
          <div className="space-y-4 pt-2 border-t border-border-subtle z-10">
            
            {/* Playback Button Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {isPlaying ? (
                  <Button onClick={handleStop} variant="secondary" size="sm" icon={Pause}>
                    Pause
                  </Button>
                ) : (
                  <Button onClick={() => triggerSignTranslation()} variant="primary" size="sm" icon={Play}>
                    Play Sign Sequence
                  </Button>
                )}

                <button
                  onClick={() => triggerSignTranslation()}
                  className="p-2 rounded-lg bg-bg-elevated hover:bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary transition-all"
                  title="Replay"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsLooping(l => !l)}
                  className={`p-2 rounded-lg border transition-all ${
                    isLooping
                      ? 'bg-accent-coral/15 text-accent-coral border-accent-coral/30'
                      : 'bg-bg-elevated text-text-secondary border-border-subtle hover:text-text-primary'
                  }`}
                  title="Toggle Loop Playback"
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Slider */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Speed: {signingSpeed.toFixed(1)}x</span>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.25"
                  value={signingSpeed}
                  onChange={(e) => setSigningSpeed(parseFloat(e.target.value))}
                  className="w-28 accent-accent-coral bg-bg-elevated border border-border-subtle h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Sign Token Breakdown Sequence Bar (Rylo Style Token Scrubbing) */}
            {signTokens.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Sign Sequence Breakdown ({targetSignLang}):
                </span>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
                  {signTokens.map((t, idx) => (
                    <button
                      key={t.id}
                      onClick={() => { setActiveWordIndex(idx); setIsSigning(true); }}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-all ${
                        idx === activeWordIndex
                          ? 'bg-accent-coral text-bg-base border-accent-coral shadow'
                          : 'bg-bg-elevated text-text-secondary border-border-subtle hover:border-accent-coral/30'
                      }`}
                    >
                      {t.symbol}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
