import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Volume2, ShieldAlert, Sparkles, X, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SoundHapticIndicator({ isListening }) {
  const [activeAlert, setActiveAlert] = useState(null);
  const [hapticCount, setHapticCount] = useState(0);

  // Simulated ambient acoustic detection for live classroom
  useEffect(() => {
    if (!isListening) return;

    // Trigger random acoustic events (Teacher calls name, door knock, bell)
    const interval = setInterval(() => {
      const chance = Math.random();
      if (chance > 0.75) {
        let alertObj = null;
        if (chance > 0.92) {
          alertObj = {
            id: Date.now(),
            type: 'NAME_CALLED',
            title: 'Your Name Called!',
            desc: 'Professor mentioned: "Alex, what do you think?"',
            intensity: 'HIGH',
            color: 'text-red-400 bg-red-500/10 border-red-500/30 shadow-red-500/20'
          };
        } else if (chance > 0.83) {
          alertObj = {
            id: Date.now(),
            type: 'LAUGHTER',
            title: 'Classroom Laughter Detected',
            desc: 'Auditory cue: Class is reacting to a joke.',
            intensity: 'MEDIUM',
            color: 'text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-amber-500/20'
          };
        } else {
          alertObj = {
            id: Date.now(),
            type: 'BELL',
            title: 'Classroom Bell / Door Knock',
            desc: 'Auditory cue: Environmental sound detected.',
            intensity: 'LOW',
            color: 'text-blue-400 bg-blue-500/10 border-blue-500/30 shadow-blue-500/20'
          };
        }

        setActiveAlert(alertObj);
        setHapticCount(prev => prev + 1);

        // Trigger browser haptic vibration API if supported on device!
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }

        // Auto dismiss after 5s
        setTimeout(() => {
          setActiveAlert(prev => prev?.id === alertObj.id ? null : prev);
        }, 5000);
      }
    }, 9000);

    return () => clearInterval(interval);
  }, [isListening]);

  return (
    <AnimatePresence>
      {activeAlert && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className={`p-3.5 rounded-xl border backdrop-blur-xl shadow-2xl flex items-start justify-between gap-3 ${activeAlert.color} animate-pulse-glow`}
        >
          <div className="flex gap-3 items-center">
            <div className="p-2 rounded-lg bg-bg-base/40 border border-white/10 shrink-0">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold font-display uppercase tracking-wider">{activeAlert.title}</h4>
                <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded bg-white/10 border border-white/10">
                  {activeAlert.intensity} HAPTIC
                </span>
              </div>
              <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">{activeAlert.desc}</p>
            </div>
          </div>

          <button
            onClick={() => setActiveAlert(null)}
            className="p-1 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
