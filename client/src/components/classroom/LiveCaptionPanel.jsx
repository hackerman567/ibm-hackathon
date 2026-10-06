import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useCaptionStore } from '../../store/useCaptionStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import Badge from '../ui/Badge';
import { Mic, MicOff } from 'lucide-react';
import ImportanceBadge from './ImportanceBadge';
import { useAddons, EmphasisBadge } from '../../addons';

export default function LiveCaptionPanel() {
  const { finalTranscript, interimText, translatedLines, isListening } = useCaptionStore();
  const { sessionTags } = useAddons();
  const { 
    captionFontSize, 
    autoTranslate, 
    targetLanguage,
    captionStyle,
    bgOpacity,
    lineSpacing
  } = useSettingsStore();
  const scrollContainerRef = useRef(null);

  // Map settings font-size key to Tailwind styles
  const fontSizes = {
    sm: 'text-xl md:text-2xl leading-normal',
    md: 'text-2xl md:text-3xl leading-relaxed',
    lg: 'text-3xl md:text-4xl leading-relaxed',
    xl: 'text-4xl md:text-5xl leading-relaxed',
    '2xl': 'text-5xl md:text-6xl leading-relaxed'
  };

  // Map line spacings to space utilities
  const spacingClasses = {
    tight: 'space-y-3',
    normal: 'space-y-4',
    relaxed: 'space-y-6',
    loose: 'space-y-8'
  };

  const currentFontSizeClass = fontSizes[captionFontSize] || fontSizes.lg;
  const currentSpacingClass = spacingClasses[lineSpacing] || spacingClasses.relaxed;
  
  // High contrast adjustments
  const isHighContrast = captionStyle === 'contrast';
  const textPrimaryColor = isHighContrast ? 'text-white font-extrabold tracking-wide' : 'text-text-primary';
  const textSecondaryColor = isHighContrast ? 'text-gray-300 font-medium' : 'text-text-secondary/60';
  const textTranslationColor = isHighContrast ? 'text-yellow-400 font-bold' : 'text-accent-coral-soft/85';

  // Auto-scroll to the bottom of caption stream
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [finalTranscript, interimText, translatedLines]);

  return (
    <div className="flex-1 flex flex-col bg-bg-surface border border-border-subtle rounded-xl overflow-hidden relative">
      <ImportanceBadge />
      {/* Panel Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-surface/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-text-primary text-base font-display">Live Captions</h2>
          {isListening && <Badge variant="live">Live</Badge>}
        </div>

        {/* Waveform Visualizer */}
        <div className="bar-equalizer px-2" title="Audio Input Level">
          {isListening ? (
            <>
              <span />
              <span />
              <span />
              <span />
            </>
          ) : (
            <div className="flex gap-[3px] items-end h-3 opacity-30">
              <div className="w-[2.5px] h-2 bg-text-tertiary rounded" />
              <div className="w-[2.5px] h-3 bg-text-tertiary rounded" />
              <div className="w-[2.5px] h-1.5 bg-text-tertiary rounded" />
            </div>
          )}
        </div>
      </div>

      {/* Caption Stream Area */}
      <div
        ref={scrollContainerRef}
        aria-live="polite"
        aria-label="Live Lecture Caption Transcript"
        className="flex-1 overflow-y-auto p-6 md:p-8 min-h-[350px] transition-all"
        style={{ backgroundColor: `rgba(0, 0, 0, ${bgOpacity / 100})` }}
      >
        {finalTranscript.length === 0 && !interimText ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 py-8">
            <div className="relative flex items-center justify-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center border transition-all ${
                isListening ? 'bg-accent-dim border-accent/30 text-accent' : 'bg-bg-elevated border-border-subtle text-text-tertiary'
              }`}>
                {isListening ? (
                  <Mic className="w-8 h-8 text-accent" />
                ) : (
                  <MicOff className="w-8 h-8" />
                )}
              </div>
              {isListening && (
                <div className="absolute inset-0 rounded-full border border-accent/30 animate-ping opacity-25" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-text-primary font-bold text-base font-display">Awaiting spoken lecture...</p>
              <p className="text-xs text-text-secondary leading-relaxed">
                {isListening 
                  ? "Microphone active and listening for teacher speech. Captions will stream here instantly."
                  : "Click 'Start Session' or 'Try Demo' in the controls panel to activate real-time transcription."}
              </p>
            </div>

            {/* Ghosted Skeleton Transcript Lines (Space reads as waiting, not broken) */}
            <div className="w-full space-y-3 pt-2 opacity-30 pointer-events-none">
              <div className="h-3.5 bg-text-tertiary/20 rounded-full w-5/6 mx-auto" />
              <div className="h-3.5 bg-text-tertiary/20 rounded-full w-full" />
              <div className="h-3.5 bg-text-tertiary/20 rounded-full w-4/6 mx-auto" />
            </div>
          </div>
        ) : (
          <div className={currentSpacingClass}>
            {finalTranscript.map((line, index) => {
              const isLast = index === finalTranscript.length - 1 && !interimText;
              const matchingTag = sessionTags.find(t => t.text && line.includes(t.text));
              return (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-2 border-l-2 border-transparent hover:border-accent-dim pl-3 transition-all"
                >
                  {matchingTag && (
                    <div className="mb-1">
                      <EmphasisBadge tag={matchingTag} />
                    </div>
                  )}
                  {/* Original Sentence */}
                  <p className={`font-semibold tracking-wide leading-[1.7] transition-colors duration-300 ${currentFontSizeClass} ${
                    isLast ? textPrimaryColor : textSecondaryColor
                  }`}>
                    {line}
                  </p>
                  
                  {/* Translated Sentence */}
                  {autoTranslate && translatedLines[index] && (
                    <p className={`italic leading-relaxed ${textTranslationColor} ${
                      currentFontSizeClass.replace('text-', 'text-base md:text-')
                    }`}>
                      {translatedLines[index]}
                    </p>
                  )}
                </motion.div>
              );
            })}

            {/* Interim Partial Sentence */}
            {interimText && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2 pl-3"
              >
                <p className={`font-semibold italic tracking-wide text-text-tertiary select-none leading-[1.7] ${currentFontSizeClass}`}>
                  {interimText}...
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
