import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../services/socket';

export default function JoinSession() {
  const { sessionId } = useParams();
  const [lines, setLines] = useState([]);
  const [interim, setInterim] = useState('');
  const [status, setStatus] = useState('connecting'); // 'connecting' | 'live' | 'error'
  const [fontSize, setFontSize] = useState(22); // cycles: 22 -> 28 -> 36 -> 22
  const [elapsed, setElapsed] = useState(0);
  const scrollRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    setStatus('connecting');
    socket.connect();
    socket.emit('join-classroom', { sessionId, role: 'student' });

    startTimeRef.current = Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    const onConnect = () => setStatus('live');
    const onDisconnect = () => setStatus('error');
    const onHistory = (history) => {
      setLines(history || []);
      setStatus('live');
    };
    const onUpdate = (payload) => {
      setLines(prev => [...prev, payload]);
      setInterim('');
      setStatus('live');
    };
    const onInterim = ({ text }) => {
      setInterim(text);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('caption-history', onHistory);
    socket.on('caption-update', onUpdate);
    socket.on('caption-interim-update', onInterim);

    return () => {
      clearInterval(timer);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('caption-history', onHistory);
      socket.off('caption-update', onUpdate);
      socket.off('caption-interim-update', onInterim);
      socket.disconnect();
    };
  }, [sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const cycleFontSize = () => {
    setFontSize(prev => prev === 22 ? 28 : prev === 28 ? 36 : 22);
  };

  const formatTimer = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <div
      onClick={cycleFontSize}
      className="min-h-screen bg-black flex flex-col select-none"
      style={{ fontFamily: '"DM Sans", sans-serif' }}
    >
      {/* Hide scrollbars globally on this page */}
      <style>{`
        ::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; }
      `}</style>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a] flex-shrink-0">
        <span className="text-[#FF4D4D] font-bold tracking-widest text-sm" style={{ fontFamily: '"Syne", sans-serif' }}>
          SIGNIFY AI
        </span>

        <div className="flex items-center gap-3">
          {status === 'live' && (
            <div className="flex items-center gap-1.5">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="w-2 h-2 rounded-full bg-[#4ADE80]"
              />
              <span className="text-[11px] text-[#4ADE80] font-bold uppercase tracking-wider">Live</span>
            </div>
          )}
          {status === 'error' && (
            <span className="text-[11px] text-[#666] font-medium">Reconnecting...</span>
          )}
          {status === 'connecting' && (
            <span className="text-[11px] text-[#666] font-medium">Connecting...</span>
          )}
        </div>
      </div>

      {/* Caption stream */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-6 flex flex-col justify-end gap-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {lines.length === 0 && (
          <div className="text-center text-[#333] text-base py-16">
            Waiting for the teacher to start speaking...
            <br />
            <span className="text-[#222] text-sm mt-2 block">Tap anywhere to change font size</span>
          </div>
        )}

        <AnimatePresence initial={false}>
          {lines.map((lineObj, idx) => {
            const age = lines.length - 1 - idx;
            const textColor = age === 0 ? '#FFFFFF' : age === 1 ? '#999999' : age === 2 ? '#555555' : '#333333';
            const translatedColor = '#FF4D4D';

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-1"
              >
                <p style={{ fontSize: `${fontSize}px`, color: textColor, lineHeight: 1.6, transition: 'color 0.5s ease' }}>
                  {lineObj.line}
                </p>
                {lineObj.translated && lineObj.translated !== lineObj.line && (
                  <p style={{ fontSize: `${fontSize - 4}px`, color: translatedColor, lineHeight: 1.5, fontStyle: 'italic' }}>
                    {lineObj.translated}
                  </p>
                )}
              </motion.div>
            );
          })}

          {interim && status === 'live' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-1">
              <p style={{ fontSize: `${fontSize}px`, color: '#666', lineHeight: 1.6, fontStyle: 'italic' }}>
                {interim}...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[#1a1a1a] flex-shrink-0">
        <span className="text-[11px] text-[#333] font-medium">
          Powered by SIGNIFY AI
        </span>
        <span className="text-[11px] text-[#444] font-mono">
          {formatTimer(elapsed)}
        </span>
      </div>
    </div>
  );
}
