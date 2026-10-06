import React from 'react';
import { AlertCircle, HelpCircle, BookOpen, Bookmark, FileText, CheckSquare, Sparkles } from 'lucide-react';

export const TAG_META = {
  EXAM_POINT: {
    label: 'Exam Point',
    icon: AlertCircle,
    badgeStyle: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    iconColor: 'text-amber-400'
  },
  EMPHASIS: {
    label: 'Teacher Stressed',
    icon: Sparkles,
    badgeStyle: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    iconColor: 'text-purple-400'
  },
  DEFINITION: {
    label: 'Definition',
    icon: BookOpen,
    badgeStyle: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    iconColor: 'text-blue-400'
  },
  QUESTION: {
    label: 'Question Asked',
    icon: HelpCircle,
    badgeStyle: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    iconColor: 'text-teal-400'
  },
  NEW_TOPIC: {
    label: 'New Topic',
    icon: Bookmark,
    badgeStyle: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    iconColor: 'text-emerald-400'
  },
  HOMEWORK: {
    label: 'Homework Note',
    icon: CheckSquare,
    badgeStyle: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    iconColor: 'text-rose-400'
  }
};

export default function EmphasisBadge({ tag, onRemove, canRemove = false }) {
  if (!tag || !tag.type) return null;

  const meta = TAG_META[tag.type] || {
    label: tag.type,
    icon: FileText,
    badgeStyle: 'bg-bg-elevated text-text-secondary border-border-subtle',
    iconColor: 'text-text-tertiary'
  };

  const IconComponent = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold transition-all shadow-sm ${meta.badgeStyle}`}
      aria-label={`Tag: ${meta.label} - ${tag.label || ''}`}
    >
      <IconComponent className={`w-3.5 h-3.5 ${meta.iconColor}`} />
      <span className="font-bold tracking-tight">{meta.label}</span>
      {tag.label && <span className="opacity-75 text-[10px] hidden sm:inline">• {tag.label}</span>}
      
      {canRemove && onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(tag.id); }}
          className="ml-1 text-text-tertiary hover:text-red-400 transition-colors"
          title="Remove Tag"
        >
          ×
        </button>
      )}
    </span>
  );
}
