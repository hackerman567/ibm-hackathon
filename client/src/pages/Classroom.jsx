import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTranslation } from '../hooks/useTranslation';
import { useCaptionStore } from '../store/useCaptionStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useLectureStore } from '../store/useLectureStore';
import { saveLecture } from '../lib/db';
import { SUPPORTED_LANGUAGES } from '../lib/translate';

import LiveCaptionPanel from '../components/classroom/LiveCaptionPanel';
import HeatmapTimeline from '../components/classroom/HeatmapTimeline';
import QRJoinPanel from '../components/classroom/QRJoinPanel';
import LectureSummarizer from '../components/ai/LectureSummarizer';
import AskAI from '../components/ai/AskAI';
import { useGroqAI } from '../hooks/useGroqAI';
import SoundHapticIndicator from '../components/classroom/SoundHapticIndicator';
import AslGrammarBridge from '../components/classroom/AslGrammarBridge';
import { StudentSessionBanner, useAddons } from '../addons';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { socket } from '../services/socket';

import {
  Mic,
  MicOff,
  Save,
  Download,
  Languages,
  BrainCircuit,
  MessageSquare,
  Clock,
  Sparkles,
  BookOpen,
  Accessibility
} from 'lucide-react';

export default function Classroom() {
  const { isListening, isDemoMode, toggleListening, toggleDemo } = useSpeechRecognition();
  const { translateLine } = useTranslation();
  const { activeSession, role } = useAddons();

  const {
    finalTranscript,
    interimText,
    wordCount,
    startTime,
    sessionId,
    actions: captionActions
  } = useCaptionStore();

  const {
    targetLanguage,
    autoTranslate,
    autoSummarize,
    actions: settingsActions
  } = useSettingsStore();

  const { actions: lectureActions } = useLectureStore();

  const [activeRightTab, setActiveRightTab] = useState('summary');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const { generateSummary } = useGroqAI();
  const prevIsListening = useRef(isListening);

  // Save session modal state
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');

  // Auto-Summarize on session end
  useEffect(() => {
    if (prevIsListening.current === true && isListening === false) {
      if (autoSummarize) {
        const fullText = [...finalTranscript, interimText].filter(Boolean).join(' ');
        if (fullText.length >= 50 && !useLectureStore.getState().currentSummary) {
          generateSummary(fullText);
        }
      }
    }
    prevIsListening.current = isListening;
  }, [isListening, autoSummarize, finalTranscript, interimText, generateSummary]);

  // Handle Socket.IO connection for live speech broadcasting & student listening
  useEffect(() => {
    const targetRoomId = activeSession?.joinCode || activeSession?.id || sessionId;
    if (!targetRoomId) return;

    // Keep store sessionId in sync with active room code
    captionActions.setSessionId(targetRoomId);

    const userRole = role === 'teacher' ? 'teacher' : 'student';
    socket.connect();
    socket.emit('join-classroom', { sessionId: targetRoomId, role: userRole });

    const onUpdate = (payload) => {
      if (payload && payload.line && userRole === 'student') {
        captionActions.addFinalLine(payload.line);
      }
    };

    const onInterim = ({ text }) => {
      if (typeof text === 'string' && userRole === 'student') {
        captionActions.setInterimText(text);
      }
    };

    const onHistory = (history) => {
      if (Array.isArray(history) && history.length > 0 && userRole === 'student') {
        history.forEach((item) => {
          if (item.line) captionActions.addFinalLine(item.line);
        });
      }
    };

    socket.on('caption-update', onUpdate);
    socket.on('caption-interim-update', onInterim);
    socket.on('caption-history', onHistory);

    return () => {
      socket.off('caption-update', onUpdate);
      socket.off('caption-interim-update', onInterim);
      socket.off('caption-history', onHistory);
      socket.disconnect();
    };
  }, [activeSession, isListening, sessionId, role]);

  // Live session timer
  useEffect(() => {
    let interval = null;
    if (isListening && startTime) {
      interval = setInterval(() => {
        const diff = Math.round((new Date() - new Date(startTime)) / 1000);
        setElapsedSeconds(diff);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening, startTime]);

  // Auto-translate each new sentence
  useEffect(() => {
    if (finalTranscript.length > 0) {
      const lastIdx = finalTranscript.length - 1;
      const lastLine = finalTranscript[lastIdx];
      translateLine(lastLine, lastIdx);
    }
  }, [finalTranscript.length, autoTranslate, targetLanguage, translateLine]);

  const formatTimer = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return [
      h > 0 ? String(h).padStart(2, '0') : null,
      String(m).padStart(2, '0'),
      String(s).padStart(2, '0')
    ].filter(Boolean).join(':');
  };

  const estimatedReadingTime = Math.ceil(wordCount / 200) || 1;

  // Export transcript as .txt file
  const handleExportTxt = () => {
    if (finalTranscript.length === 0) {
      toast.error('No transcript yet. Start recording or try the demo first.');
      return;
    }

    const titleStr = `SIGNIFY AI — Session Notes (${new Date().toLocaleDateString()})`;
    const dateStr = `Date: ${new Date().toLocaleString()}`;
    const transcriptHeader = '\n--- CAPTION TRANSCRIPT ---\n';
    const transcriptBody = finalTranscript.join('\n');

    let content = `${titleStr}\n${dateStr}\n${transcriptHeader}${transcriptBody}`;

    if (autoTranslate) {
      const activeLanguage = SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)?.name || targetLanguage;
      const translationLines = useCaptionStore.getState().translatedLines;
      const translationHeader = `\n\n--- TRANSLATIONS (${activeLanguage.toUpperCase()}) ---\n`;
      const translationBody = translationLines.filter(Boolean).join('\n');
      content += `${translationHeader}${translationBody}`;
    }

    const currentSummary = useLectureStore.getState().currentSummary;
    if (currentSummary) {
      content += `\n\n--- AI STUDY NOTES ---\n${currentSummary}`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signify-session-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Transcript downloaded!');
  };

  // Open save modal
  const handleOpenSaveModal = () => {
    if (finalTranscript.length === 0) {
      toast.error('No content to save. Start recording or run the demo first.');
      return;
    }
    setSessionTitle(`Session — ${new Date().toLocaleDateString()}`);
    setSaveModalOpen(true);
  };

  // Confirm save to local storage
  const handleConfirmSave = async () => {
    const title = sessionTitle.trim() || `Session — ${new Date().toLocaleDateString()}`;

    const lectureData = {
      title,
      transcript: finalTranscript.join(' '),
      translatedTranscript: useCaptionStore.getState().translatedLines.filter(Boolean).join(' '),
      targetLanguage,
      summary: useLectureStore.getState().currentSummary || '',
      keyPoints: useLectureStore.getState().keyPoints || [],
      examQuestions: useLectureStore.getState().examQuestions || [],
      wordCount,
      duration: elapsedSeconds || 1,
      createdAt: new Date().toISOString(),
      sessionId
    };

    try {
      await saveLecture(lectureData);
      toast.success('Session saved to history!');
      setSaveModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save session. Please try again.');
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 min-h-[calc(100vh-4rem)]">

      {/* Student Session Access & Join Code space */}
      <StudentSessionBanner />

      {/* JUDGES' FEATURE 1: Acoustic Sound & Haptic Notification Bar */}
      <SoundHapticIndicator isListening={isListening} />

      {/* Main split panels */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-10 gap-6 min-h-0">

        {/* Left: Live Caption Panel + ASL Grammar Bridge */}
        <div className="lg:col-span-6 flex flex-col min-h-0 space-y-4">
          <div className="flex-1 min-h-0 flex flex-col">
            <LiveCaptionPanel />
          </div>

          {/* JUDGES' FEATURE 2: Real-time ASL Grammar Syntax Transformer */}
          <AslGrammarBridge currentTranscript={[...finalTranscript, interimText].filter(Boolean).slice(-1)[0]} />
        </div>

        {/* Right: AI Panel */}
        <div className="lg:col-span-4 flex flex-col min-h-0 bg-bg-raised border border-border-subtle rounded-2xl overflow-hidden shadow-xl">

          {/* Tab Header with Sliding layoutId Active Indicator */}
          <div className="flex border-b border-border-subtle bg-bg-surface/50 relative">
            <button
              onClick={() => setActiveRightTab('summary')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold font-mono uppercase tracking-wider transition-colors relative focus:outline-none ${activeRightTab === 'summary'
                ? 'text-accent font-bold'
                : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Summary Analysis</span>
              {activeRightTab === 'summary' && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveRightTab('ask_tutor')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold font-mono uppercase tracking-wider transition-colors relative focus:outline-none ${activeRightTab === 'ask_tutor'
                ? 'text-accent font-bold'
                : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI Tutor</span>
              {activeRightTab === 'ask_tutor' && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          </div>

          {/* Controls strip */}
          <div className="px-5 py-3.5 border-b border-border-subtle bg-bg-elevated/50 flex flex-wrap gap-4 items-center justify-between">
            {/* Language selector */}
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-accent-coral" />
              <select
                value={targetLanguage}
                onChange={(e) => settingsActions.setTargetLanguage(e.target.value)}
                className="bg-bg-surface border border-border-subtle rounded-md px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:border-accent-coral transition-colors cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoTranslate}
                  onChange={settingsActions.toggleAutoTranslate}
                  className="rounded border-border-subtle text-accent-coral focus:ring-0 cursor-pointer w-3.5 h-3.5"
                />
                <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Translate</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoSummarize}
                  onChange={settingsActions.toggleAutoSummarize}
                  className="rounded border-border-subtle text-accent-coral focus:ring-0 cursor-pointer w-3.5 h-3.5"
                />
                <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Auto-Notes</span>
              </label>
            </div>
          </div>

          {/* QR Share Panel */}
          <div className="px-5 pb-2 shrink-0">
            <QRJoinPanel />
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeRightTab === 'summary' ? (
              <LectureSummarizer />
            ) : (
              <AskAI />
            )}
          </div>
        </div>
      </div>

      <HeatmapTimeline />

      {/* Bottom Control Bar */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 md:px-6 flex flex-wrap gap-4 items-center justify-between shrink-0 relative z-50">

        {/* Recording controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={toggleListening}
            variant={isListening && !isDemoMode ? 'danger' : 'primary'}
            icon={isListening && !isDemoMode ? MicOff : Mic}
            className="font-display font-bold uppercase tracking-wider"
          >
            {isListening && !isDemoMode ? 'Stop Recording' : 'Begin Recording'}
          </Button>

          <Button
            onClick={toggleDemo}
            variant="ghost"
            icon={Sparkles}
            className="text-xs uppercase tracking-wider"
          >
            {isListening && isDemoMode ? 'Stop Demo' : 'Try Demo'}
          </Button>
        </div>

        {/* Session stats */}
        {isListening && (
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-text-secondary bg-black/10 px-4 py-2 rounded-lg border border-border-subtle">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-accent-coral" />
              <span>Duration: <strong className="text-text-primary">{formatTimer(elapsedSeconds)}</strong></span>
            </div>
            <div className="hidden sm:block h-3 w-px bg-border-subtle" />
            <div>
              <span>Words: <strong className="text-text-primary">{wordCount}</strong></span>
            </div>
            <div className="hidden sm:block h-3 w-px bg-border-subtle" />
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-accent-coral" />
              <span>Reading: <strong className="text-text-primary">{estimatedReadingTime} min</strong></span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => window.open('/avatar', '_blank')}
            variant="ghost"
            size="sm"
            icon={Accessibility}
            className="text-accent-coral border-accent-coral/20 hover:bg-accent-coral/10"
          >
            Sign Avatar Player
          </Button>
          <Button
            onClick={handleOpenSaveModal}
            disabled={finalTranscript.length === 0}
            variant="ghost"
            size="sm"
            icon={Save}
          >
            Save Session
          </Button>
          <Button
            onClick={handleExportTxt}
            disabled={finalTranscript.length === 0}
            variant="ghost"
            size="sm"
            icon={Download}
          >
            Download Transcript
          </Button>
        </div>
      </div>

      {/* Save Session Modal — replaces browser prompt() */}
      <Modal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Save Session"
      >
        <div className="space-y-5">
          <p className="text-sm text-text-secondary">
            Give this session a name so you can find it easily in your history.
          </p>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Session Name</label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmSave()}
              autoFocus
              placeholder="e.g. Biology Lecture — Week 3"
              className="w-full bg-bg-elevated border border-border-subtle hover:border-accent-coral/30 focus:border-accent-coral focus:ring-1 focus:ring-accent-coral/20 rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button onClick={() => setSaveModalOpen(false)} variant="ghost" size="sm">
              Cancel
            </Button>
            <Button onClick={handleConfirmSave} variant="primary" size="sm" icon={Save}>
              Save Session
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
