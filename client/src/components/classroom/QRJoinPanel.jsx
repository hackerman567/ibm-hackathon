import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { Copy, Users, Check, QrCode, ToggleLeft, ToggleRight } from 'lucide-react';
import { useCaptionStore } from '../../store/useCaptionStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { socket } from '../../services/socket';

export default function QRJoinPanel() {
  const { isListening, sessionId, finalTranscript, translatedLines } = useCaptionStore();
  const { targetLanguage } = useSettingsStore();
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [joinUrl, setJoinUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoPush, setAutoPush] = useState(true);
  const [studentCount, setStudentCount] = useState(0);
  const lastPushedIdx = useRef(-1);
  const demoCounterRef = useRef(null);

  // Create session when session starts
  useEffect(() => {
    if (!isListening || !sessionId) {
      setQrDataUrl('');
      setJoinUrl('');
      setStudentCount(0);
      lastPushedIdx.current = -1;
      if (demoCounterRef.current) clearTimeout(demoCounterRef.current);
      return;
    }

    const url = `${window.location.origin}/join/${sessionId}`;
    setJoinUrl(url);

    // Generate QR code as data URL
    QRCode.toDataURL(url, {
      color: { dark: '#0D0D0F', light: '#F5F0E8' },
      margin: 2,
      width: 180
    }).then(setQrDataUrl).catch(console.error);

    // Register session on backend
    fetch('/api/sessions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, hostName: 'Teacher' })
    }).catch(console.error);

    // Demo: auto-increment student count (+1 at 5s, +1 at 18s, +1 at 31s)
    let count = 0;
    const schedule = [5000, 13000, 13000];
    const addStudent = (delays, i) => {
      if (i >= delays.length) return;
      demoCounterRef.current = setTimeout(() => {
        count++;
        setStudentCount(count);
        addStudent(delays, i + 1);
      }, delays[i]);
    };
    addStudent(schedule, 0);

    return () => {
      if (demoCounterRef.current) clearTimeout(demoCounterRef.current);
    };
  }, [isListening, sessionId]);

  // Auto-push new caption lines to backend SSE store
  useEffect(() => {
    if (!autoPush || !isListening || !sessionId) return;
    if (finalTranscript.length === 0) return;

    const lastIdx = finalTranscript.length - 1;
    if (lastIdx <= lastPushedIdx.current) return;

    lastPushedIdx.current = lastIdx;
    const line = finalTranscript[lastIdx];
    const translated = translatedLines[lastIdx] || '';

    if (socket.connected) {
      socket.emit('caption-final', {
        sessionId,
        line,
        translated: translated || ''
      });
    }
  }, [finalTranscript.length, autoPush, isListening, sessionId, translatedLines, targetLanguage]);

  const copyUrl = () => {
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isListening || !sessionId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="mt-4 p-4 bg-bg-surface border border-border-subtle rounded-xl flex flex-col gap-3"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-accent-coral" />
            <span className="text-xs font-bold font-display uppercase tracking-wider text-text-primary">
              Share with Students
            </span>
          </div>
          {studentCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.25)] px-2.5 py-1 rounded-full"
            >
              <Users className="w-3 h-3 text-[#4ADE80]" />
              <span className="text-[10px] font-bold text-[#4ADE80]">{studentCount} watching</span>
            </motion.div>
          )}
        </div>

        {/* QR Code */}
        {qrDataUrl && (
          <div className="flex justify-center">
            <div className="p-2 bg-[#F5F0E8] rounded-lg">
              <img src={qrDataUrl} alt="QR Join Code" className="w-[140px] h-[140px] block" />
            </div>
          </div>
        )}

        {/* Copyable URL */}
        <div className="flex items-center gap-2 bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2">
          <span className="text-[10px] text-text-secondary flex-1 truncate font-mono">
            {joinUrl.replace('http://', '').replace('https://', '')}
          </span>
          <button
            onClick={copyUrl}
            className="text-text-muted hover:text-accent-coral transition-colors flex-shrink-0"
            title="Copy link"
          >
            {copied
              ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" />
              : <Copy className="w-3.5 h-3.5" />
            }
          </button>
        </div>

        {/* Auto Push Toggle */}
        <button
          onClick={() => setAutoPush(p => !p)}
          className="flex items-center justify-between text-[11px] text-text-secondary hover:text-text-primary transition-colors w-full"
        >
          <span className="font-medium">Auto-push captions</span>
          {autoPush
            ? <ToggleRight className="w-5 h-5 text-accent-coral" />
            : <ToggleLeft className="w-5 h-5 text-text-muted" />
          }
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
