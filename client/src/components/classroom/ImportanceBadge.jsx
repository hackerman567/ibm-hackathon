import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useLectureStore } from '../../store/useLectureStore';
import { useCaptionStore } from '../../store/useCaptionStore';

const TECHNICAL_WORDS = [
  'quantum', 'derivative', 'mitochondria', 'theorem', 'integral', 'entropy',
  'photosynthesis', 'chlorophyll', 'algorithm', 'nucleotide', 'equation'
];

export default function ImportanceBadge() {
  const { currentImportance } = useLectureStore();
  const { isListening } = useCaptionStore();
  const [badgeState, setBadgeState] = useState({
    type: 'NORMAL',
    text: 'Lecture in Progress',
    icon: '💬',
    style: {
      bg: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      color: '#8A8A9A'
    }
  });

  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (!currentImportance) return;

    const now = Date.now();
    // Debounce: minimum 8 seconds before changing state (unless first load)
    if (now - lastUpdateRef.current < 8000 && lastUpdateRef.current !== 0) return;

    const { type, importance, label = '' } = currentImportance;

    let nextState = {
      type: 'NORMAL',
      text: 'Lecture in Progress',
      icon: '💬',
      style: {
        bg: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#8A8A9A'
      }
    };

    const hasTechWord = TECHNICAL_WORDS.some(w => label.toLowerCase().includes(w));

    if (type === 'exam') {
      nextState = {
        type: 'HIGH_EXAM',
        text: 'EXAM ALERT',
        icon: '🎯',
        style: {
          bg: 'rgba(255,77,77,0.15)',
          border: '1px solid rgba(255,77,77,0.5)',
          color: '#FF4D4D'
        }
      };
      toast('⚠️ Exam topic detected — saving to study notes', {
        position: 'bottom-right',
        icon: '⚠️',
        style: {
          background: '#1C1C1F',
          color: '#FF4D4D',
          border: '1px solid rgba(255,77,77,0.2)'
        }
      });
    } else if (importance === 'high' && type === 'concept' && hasTechWord) {
      nextState = {
        type: 'SIMPLIFIED_AVAILABLE',
        text: 'Complex Topic — Tap to Simplify',
        icon: '🤔',
        style: {
          bg: 'rgba(96,165,250,0.12)',
          border: '1px solid rgba(96,165,250,0.4)',
          color: '#60A5FA'
        }
      };
    } else if (['concept', 'formula'].includes(type) && importance !== 'low') {
      nextState = {
        type: 'IMPORTANT_CONCEPT',
        text: 'Key Concept',
        icon: '🔆',
        style: {
          bg: 'rgba(251,146,60,0.12)',
          border: '1px solid rgba(251,146,60,0.4)',
          color: '#FB923C'
        }
      };
    }

    if (nextState.type !== badgeState.type) {
      setBadgeState(nextState);
      lastUpdateRef.current = now;
    }
  }, [currentImportance, badgeState.type]);

  const handleSimplifyTap = () => {
    window.dispatchEvent(new CustomEvent('TRIGGER_SIMPLIFY', {
      detail: "The teacher just said a complex topic. Explain this simply for a student."
    }));
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      {!isListening ? null : (
        <AnimatePresence mode="wait">
        <motion.button
          key={badgeState.type}
          initial={{ opacity: 0, y: -5 }}
          animate={
            badgeState.type === 'HIGH_EXAM'
              ? { opacity: 1, y: 0, scale: [1, 1.04, 1] }
              : { opacity: 1, y: 0, scale: 1 }
          }
          exit={{ opacity: 0, y: 5 }}
          transition={
            badgeState.type === 'HIGH_EXAM'
              ? { scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.25 } }
              : { duration: 0.25 }
          }
          onClick={badgeState.type === 'SIMPLIFIED_AVAILABLE' ? handleSimplifyTap : undefined}
          className={`flex items-center gap-2 px-4 h-9 rounded-full font-medium text-[13px] whitespace-nowrap tracking-wide
            ${badgeState.type === 'IMPORTANT_CONCEPT' ? 'shadow-[0_0_15px_rgba(251,146,60,0.2)]' : ''}
          `}
          style={{
            backgroundColor: badgeState.style.bg,
            border: badgeState.style.border,
            color: badgeState.style.color,
            cursor: badgeState.type === 'SIMPLIFIED_AVAILABLE' ? 'pointer' : 'default',
            fontFamily: '"DM Sans", sans-serif'
          }}
        >
          <span>{badgeState.icon}</span>
          <span>{badgeState.text}</span>
        </motion.button>
        </AnimatePresence>
      )}
    </div>
  );
}
