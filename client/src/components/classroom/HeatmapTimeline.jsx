import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCaptionStore } from '../../store/useCaptionStore';

const COLOR_MAP = {
  exam: 'bg-[#FF4D4D] shadow-[0_0_8px_2px_rgba(255,77,77,0.4)]',
  concept: 'bg-[#FB923C]',
  formula: 'bg-[#FACC15]',
  example: 'bg-[#4ADE80]',
  story: 'bg-[#60A5FA]',
  normal: 'bg-text-secondary'
};

const LEGEND_ITEMS = [
  { type: 'exam', label: 'Exam', color: 'bg-[#FF4D4D]' },
  { type: 'concept', label: 'Concept', color: 'bg-[#FB923C]' },
  { type: 'formula', label: 'Formula', color: 'bg-[#FACC15]' },
  { type: 'example', label: 'Example', color: 'bg-[#4ADE80]' },
  { type: 'story', label: 'Story', color: 'bg-[#60A5FA]' },
];

export default function HeatmapTimeline() {
  const { isListening, heatmapMarkers, startTime } = useCaptionStore();
  const [elapsed, setElapsed] = useState(0);

  // Sync elapsed time for the timeline progression
  useEffect(() => {
    let interval;
    if (isListening && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [isListening, startTime]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <AnimatePresence>
      {isListening && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-[88px] md:bottom-[96px] left-0 right-0 h-[72px] bg-[#141416] border-t border-[rgba(255,255,255,0.06)] z-40 flex items-center px-4 md:px-8 gap-4 md:gap-6 shadow-2xl"
        >
          {/* Timer */}
          <div className="text-text-primary font-bold font-display w-12 md:w-16 text-center text-sm md:text-base">
            {formatTime(elapsed)}
          </div>

          {/* Timeline Bar */}
          <div className="flex-1 relative h-2 bg-[#1C1C1F] rounded-full mx-2 md:mx-4">
            {heatmapMarkers.map((marker) => {
              // Use the larger of elapsed or max marker timestamp as the window
              // This keeps markers pinned and prevents shifting
              const windowEnd = Math.max(elapsed, ...heatmapMarkers.map(m => m.timestamp), 1);
              const leftPos = Math.min((marker.timestamp / windowEnd) * 100, 98);
              const colorClass = COLOR_MAP[marker.type] || COLOR_MAP.normal;
              
              return (
                <div key={marker.id} className="absolute top-1/2 -translate-y-1/2 group" style={{ left: `${leftPos}%` }}>
                  <motion.div 
                    initial={{ scale: 0, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 12 }}
                    className={`w-3 h-3 rounded-full cursor-pointer ${colorClass} ${marker.type === 'exam' ? 'animate-pulse' : ''}`}
                  />
                  
                  {/* Tooltip Card */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:flex flex-col w-48 bg-bg-elevated border border-border-subtle rounded-xl p-3 shadow-xl z-50 pointer-events-none">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        {marker.type}
                      </span>
                      <span className="text-[10px] text-text-secondary">
                        {formatTime(marker.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-text-primary font-bold mb-1 leading-tight">
                      {marker.label}
                    </p>
                    <p className="text-[10px] text-text-secondary leading-tight line-clamp-2">
                      {marker.reason}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="hidden lg:flex gap-4 text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
            {LEGEND_ITEMS.map(item => (
              <div key={item.type} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                {item.label}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
