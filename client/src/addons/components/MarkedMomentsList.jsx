import React, { useState } from 'react';
import { Bookmark, Filter, Search, ChevronRight } from 'lucide-react';
import { useAddons } from '../context/AddonsContext';
import EmphasisBadge, { TAG_META } from './EmphasisBadge';

export default function MarkedMomentsList({ onJumpToLine }) {
  const { sessionTags, role, removeTag } = useAddons();
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTags = sessionTags.filter(t => {
    if (selectedType !== 'ALL' && t.type !== selectedType) return false;
    if (searchQuery && !t.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 text-text-primary space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-accent-coral/10 text-accent-coral border border-accent-coral/20">
            <Bookmark className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold font-display">Marked Moments ({sessionTags.length})</h3>
        </div>

        {/* Search Input */}
        <div className="relative max-w-[160px]">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tags..."
            className="w-full pl-8 pr-2 py-1 bg-bg-elevated border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:border-accent-coral"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-1.5 text-[11px]">
        <button
          onClick={() => setSelectedType('ALL')}
          className={`px-2.5 py-1 rounded-lg border font-semibold transition-all ${
            selectedType === 'ALL'
              ? 'bg-accent-coral/10 text-accent-coral border-accent-coral'
              : 'bg-bg-elevated text-text-secondary border-border-subtle hover:text-text-primary'
          }`}
        >
          All ({sessionTags.length})
        </button>
        {Object.keys(TAG_META).map(key => {
          const count = sessionTags.filter(t => t.type === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setSelectedType(key)}
              className={`px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                selectedType === key
                  ? 'bg-accent-coral/10 text-accent-coral border-accent-coral'
                  : 'bg-bg-elevated text-text-secondary border-border-subtle hover:text-text-primary'
              }`}
            >
              {TAG_META[key].label} ({count})
            </button>
          );
        })}
      </div>

      {/* Tags List */}
      {filteredTags.length === 0 ? (
        <div className="text-center py-6 text-xs text-text-tertiary">
          No marked moments found matching filter.
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredTags.map((tag) => (
            <div
              key={tag.id}
              onClick={() => onJumpToLine && onJumpToLine(tag.segmentId)}
              className="group p-3 rounded-xl bg-bg-elevated hover:bg-bg-elevated/80 border border-border-subtle hover:border-border-default cursor-pointer transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <EmphasisBadge tag={tag} onRemove={removeTag} canRemove={role === 'teacher'} />
                <span className="text-[10px] text-text-tertiary font-mono">
                  {new Date(tag.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-text-primary line-clamp-2 italic font-serif">
                "{tag.text}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
