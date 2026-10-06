import React from 'react';
import { useLectureStore } from '../../store/useLectureStore';
import { useCaptionStore } from '../../store/useCaptionStore';
import { useGroqAI } from '../../hooks/useGroqAI';
import Button from '../ui/Button';
import { Sparkles, Brain, Award, HelpCircle } from 'lucide-react';

// Custom Markdown formatter to render Groq educational outputs cleanly without extra dependencies
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const cleanLine = line.trim();
    if (cleanLine.startsWith('###')) {
      return <h4 key={idx} className="text-sm font-bold text-text-primary mt-4 mb-2 font-display uppercase tracking-wider text-accent-coral">{cleanLine.replace('###', '').trim()}</h4>;
    }
    if (cleanLine.startsWith('##')) {
      return <h3 key={idx} className="text-base font-bold text-text-primary mt-5 mb-2.5 font-display border-b border-border-subtle pb-1">{cleanLine.replace('##', '').trim()}</h3>;
    }
    if (cleanLine.startsWith('#')) {
      return <h2 key={idx} className="text-lg font-bold text-text-primary mt-6 mb-3 font-display border-b border-accent-coral/25 pb-1">{cleanLine.replace('#', '').trim()}</h2>;
    }
    if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
      return <li key={idx} className="ml-4 list-disc text-sm text-text-secondary mt-1.5 leading-relaxed">{cleanLine.slice(1).trim()}</li>;
    }
    if (cleanLine.length === 0) {
      return <div key={idx} className="h-2" />;
    }
    return <p key={idx} className="text-sm text-text-secondary leading-relaxed mt-2">{cleanLine}</p>;
  });
}

export default function LectureSummarizer() {
  const { currentSummary, keyPoints, examQuestions, isSummarizing } = useLectureStore();
  const { finalTranscript, interimText } = useCaptionStore();
  const { generateSummary, loadingSummary } = useGroqAI();

  const fullTranscript = [...finalTranscript, interimText].filter(Boolean).join(' ');
  const hasContent = fullTranscript.length >= 50;

  const handleGenerate = () => {
    generateSummary(fullTranscript);
  };

  return (
    <div className="space-y-4">
      {/* Action Button */}
      {!currentSummary && !loadingSummary && (
        <div className="glass-panel p-6 rounded-xl text-center space-y-4">
          <Brain className="w-10 h-10 text-accent-coral mx-auto animate-pulse" />
          <div>
            <h3 className="font-bold text-text-primary font-display text-sm">Generate Study Notes</h3>
            <p className="text-xs text-text-secondary mt-1">
              Analyze the lecture transcript to generate an AI summary, key takeaways, and practice questions.
            </p>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={!hasContent}
            variant="primary"
            className="w-full"
            icon={Sparkles}
          >
            {hasContent ? 'Generate Notes' : 'Start Lecture First'}
          </Button>
          {!hasContent && (
            <p className="text-[10px] text-text-muted">
              (Speech transcript required)
            </p>
          )}
        </div>
      )}

      {/* Loading Skeleton */}
      {loadingSummary && (
        <div className="glass-panel p-6 rounded-xl space-y-5 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-bg-elevated" />
            <div className="h-4 bg-bg-elevated rounded w-1/3" />
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-bg-elevated rounded w-full" />
            <div className="h-4 bg-bg-elevated rounded w-[92%]" />
            <div className="h-4 bg-bg-elevated rounded w-[78%]" />
          </div>
          <div className="pt-4 border-t border-border-subtle/50 space-y-2">
            <div className="h-3 bg-bg-elevated rounded w-[60%]" />
            <div className="h-3 bg-bg-elevated rounded w-[65%]" />
          </div>
        </div>
      )}

      {/* Summary Content Cards */}
      {currentSummary && !loadingSummary && (
        <div className="space-y-4">
          {/* Summary Text */}
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-3 mb-4">
              <Brain className="w-5 h-5 text-accent-coral" />
              <h3 className="font-bold text-text-primary text-sm font-display">Lecture Summary</h3>
            </div>
            <div className="space-y-1">
              {renderMarkdown(currentSummary)}
            </div>
          </div>

          {/* Key points & Exam Questions Side-by-Side or Stacked */}
          {keyPoints.length > 0 && (
            <div className="glass-panel p-6 rounded-xl">
              <div className="flex items-center gap-2 border-b border-border-subtle pb-3 mb-4">
                <Award className="w-5 h-5 text-accent-coral" />
                <h3 className="font-bold text-text-primary text-sm font-display">Key Takeaways</h3>
              </div>
              <ul className="space-y-2">
                {keyPoints.map((point, idx) => (
                  <li key={idx} className="text-xs text-text-secondary flex gap-2.5 items-start leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-coral mt-1.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {examQuestions.length > 0 && (
            <div className="glass-panel p-6 rounded-xl">
              <div className="flex items-center gap-2 border-b border-border-subtle pb-3 mb-4">
                <HelpCircle className="w-5 h-5 text-accent-coral" />
                <h3 className="font-bold text-text-primary text-sm font-display">Practice Questions</h3>
              </div>
              <ol className="space-y-3">
                {examQuestions.map((question, idx) => (
                  <li key={idx} className="text-xs text-text-secondary flex gap-3 items-start leading-relaxed">
                    <span className="font-bold text-accent-coral font-display">Q{idx + 1}.</span>
                    <span>{question}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Re-generate button */}
          <div className="flex justify-end">
            <Button
              onClick={handleGenerate}
              variant="ghost"
              size="sm"
              icon={Sparkles}
            >
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
