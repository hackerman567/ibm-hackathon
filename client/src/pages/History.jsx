import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllLectures, deleteLecture } from '../lib/db';
import { SUPPORTED_LANGUAGES } from '../lib/translate';

import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

import { 
  Search, 
  Trash2, 
  Clock, 
  FileText, 
  BookOpen, 
  Languages, 
  ArrowLeft,
  ArrowRight,
  Brain,
  Download
} from 'lucide-react';

export default function History() {
  const [searchParams] = useSearchParams();
  const [lectures, setLectures] = useState([]);
  const [filteredLectures, setFilteredLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected lecture details modal
  const [activeLectureDetail, setActiveLectureDetail] = useState(null);

  const loadAllHistory = async () => {
    try {
      const data = await getAllLectures();
      setLectures(data);
      setFilteredLectures(data);

      // Auto-open specific lecture if passed in query string (e.g. ?id=3)
      const urlId = searchParams.get('id');
      if (urlId) {
        const found = data.find(l => l.id === Number(urlId));
        if (found) {
          setActiveLectureDetail(found);
        }
      }
    } catch (err) {
      toast.error('Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllHistory();
  }, [searchParams]);

  // Execute filtering when query or language filters update
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = lectures.filter(lec => {
      const matchesSearch = 
        (lec.title && lec.title.toLowerCase().includes(query)) || 
        (lec.transcript && lec.transcript.toLowerCase().includes(query)) ||
        (lec.summary && lec.summary.toLowerCase().includes(query));
      
      const matchesLanguage = 
        selectedLanguage === 'all' || 
        lec.targetLanguage === selectedLanguage;

      return matchesSearch && matchesLanguage;
    });

    setFilteredLectures(filtered);
    setCurrentPage(1); // Reset to first page
  }, [searchQuery, selectedLanguage, lectures]);

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Stop parent click (open detail) trigger
    if (!confirm('Are you sure you want to delete this lecture archive?')) return;

    try {
      await deleteLecture(id);
      setLectures(prev => prev.filter(l => l.id !== id));
      toast.success('Lecture removed.');
      if (activeLectureDetail?.id === id) {
        setActiveLectureDetail(null);
      }
    } catch (err) {
      toast.error('Failed to delete.');
    }
  };

  // Pagination bounds
  const totalPages = Math.ceil(filteredLectures.length / itemsPerPage) || 1;
  const paginatedLectures = filteredLectures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Formatting helpers
  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  // Custom Markdown formatter to render summary
  const renderMarkdown = (text) => {
    if (!text) return <p className="text-text-muted italic">No summary generated for this lecture.</p>;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const cleanLine = line.trim();
      if (cleanLine.startsWith('###')) {
        return <h4 key={idx} className="text-xs font-bold text-accent-coral mt-4 mb-1.5 uppercase font-display">{cleanLine.replace('###', '').trim()}</h4>;
      }
      if (cleanLine.startsWith('##')) {
        return <h3 key={idx} className="text-sm font-bold text-text-primary mt-4 mb-2 font-display border-b border-border-subtle pb-0.5">{cleanLine.replace('##', '').trim()}</h3>;
      }
      if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
        return <li key={idx} className="ml-4 list-disc text-xs text-text-secondary mt-1">{cleanLine.slice(1).trim()}</li>;
      }
      if (cleanLine.length === 0) return <div key={idx} className="h-1.5" />;
      return <p key={idx} className="text-xs text-text-secondary leading-relaxed mt-1">{cleanLine}</p>;
    });
  };

  // Extract unique languages present in saved history
  const savedLanguages = [
    ...new Set(lectures.map(l => l.targetLanguage).filter(lang => lang && lang !== 'en'))
  ].map(code => SUPPORTED_LANGUAGES.find(l => l.code === code)).filter(Boolean);

  // Export transcript from detail view
  const handleExportTxt = (lec) => {
    const titleStr = `SIGNIFY AI - Lecture Notes (${lec.title})`;
    const dateStr = `Date: ${new Date(lec.createdAt).toLocaleString()}`;
    const transcriptHeader = '\n--- ORIGINAL CAPTION TRANSCRIPT ---\n';
    const transcriptBody = lec.transcript;
    
    let content = `${titleStr}\n${dateStr}\n${transcriptHeader}${transcriptBody}`;

    if (lec.translatedTranscript) {
      const matchedLanguage = SUPPORTED_LANGUAGES.find(l => l.code === lec.targetLanguage)?.name || lec.targetLanguage;
      const translationHeader = `\n\n--- TRANSLATED SUBTITLES (${matchedLanguage.toUpperCase()}) ---\n`;
      content += `${translationHeader}${lec.translatedTranscript}`;
    }

    if (lec.summary) {
      content += `\n\n--- AI SUMMARY & STUDY NOTES ---\n${lec.summary}`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signify-${lec.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Lecture notes exported!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight font-display">
          Lecture History
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Review past lectures, search transript content, and read generated study notes
        </p>
      </div>

      {/* Search & Filter Controls bar */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within lecture titles, transcripts, or summaries..."
            className="w-full bg-bg-elevated border border-border-subtle hover:border-accent-coral/25 focus:border-accent-coral focus:ring-1 focus:ring-accent-coral/30 rounded-lg pl-10 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
          />
        </div>

        {/* Translation Language Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary mr-1">Filter Language:</span>
          
          <button
            onClick={() => setSelectedLanguage('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              selectedLanguage === 'all'
                ? 'bg-accent-coral/10 text-accent-coral border-accent-coral/20'
                : 'bg-bg-elevated text-text-secondary border-border-subtle hover:text-text-primary'
            }`}
          >
            All Languages
          </button>

          {savedLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors flex items-center gap-1 ${
                selectedLanguage === lang.code
                  ? 'bg-accent-coral/10 text-accent-coral border-accent-coral/20'
                  : 'bg-bg-elevated text-text-secondary border-border-subtle hover:text-text-primary'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lectures Masonry Grid */}
      {loading ? (
        <div className="py-20 text-center text-text-secondary text-sm">Loading lecture archives...</div>
      ) : filteredLectures.length === 0 ? (
        <div className="glass-panel p-16 text-center space-y-4 max-w-md mx-auto rounded-xl">
          <div className="p-4 bg-bg-elevated border border-border-subtle rounded-full text-text-muted w-fit mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-text-primary font-bold text-base font-display">No archived lectures</h3>
            <p className="text-xs text-text-secondary mt-1">
              No archives matched your current search filters. Try typing a different query.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedLectures.map((lec) => {
              // Decide card borders (warm/cool) based on wordCount
              const isWarm = lec.wordCount > 1500;
              const matchedLanguage = SUPPORTED_LANGUAGES.find(l => l.code === lec.targetLanguage);

              return (
                <div
                  key={lec.id}
                  onClick={() => setActiveLectureDetail(lec)}
                  className={`bg-bg-surface border rounded-xl p-5 cursor-pointer glass-card-hover flex flex-col justify-between h-64 relative overflow-hidden group ${
                    isWarm ? 'border-accent-coral/15' : 'border-indigo-500/15'
                  }`}
                >
                  {/* Subtle top indicator glow */}
                  <div className={`absolute top-0 left-0 right-0 h-[3px] ${
                    isWarm ? 'bg-accent-coral' : 'bg-indigo-500'
                  }`} />

                  {/* Header info */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] text-text-muted font-semibold">
                      <span>{new Date(lec.createdAt).toLocaleDateString()}</span>
                      <div className="flex gap-1">
                        <Badge variant="count">{formatDuration(lec.duration)}</Badge>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-text-primary font-display leading-snug line-clamp-2 group-hover:text-accent-coral transition-colors">
                      {lec.title}
                    </h3>

                    <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                      {lec.transcript}
                    </p>
                  </div>

                  {/* Footer Stats & delete */}
                  <div className="flex items-center justify-between pt-4 border-t border-border-subtle/50 mt-4 shrink-0">
                    <div className="flex gap-3 text-[10px] font-semibold text-text-secondary">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-text-muted" />
                        {lec.wordCount} words
                      </span>
                      {matchedLanguage && (
                        <span className="flex items-center gap-1">
                          <Languages className="w-3.5 h-3.5 text-text-muted" />
                          {matchedLanguage.flag} {matchedLanguage.name}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleDelete(lec.id, e)}
                      className="p-1.5 rounded bg-transparent hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors focus:outline-none"
                      title="Delete archive"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Manual Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border-subtle/50 pt-6">
              <span className="text-xs text-text-secondary">
                Page <strong className="text-text-primary">{currentPage}</strong> of <strong className="text-text-primary">{totalPages}</strong> ({filteredLectures.length} total)
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  variant="ghost"
                  size="sm"
                  icon={ArrowLeft}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="ghost"
                  size="sm"
                  icon={ArrowRight}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expanded Lecture Detail Modal */}
      <Modal
        isOpen={!!activeLectureDetail}
        onClose={() => setActiveLectureDetail(null)}
        title={activeLectureDetail?.title || 'Lecture Detail'}
        size="xl"
      >
        {activeLectureDetail && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            
            {/* Meta Row */}
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-text-secondary bg-black/20 p-3 rounded-lg border border-border-subtle">
              <div>Date: <strong className="text-text-primary">{new Date(activeLectureDetail.createdAt).toLocaleString()}</strong></div>
              <div className="w-px h-3 bg-border-subtle" />
              <div>Duration: <strong className="text-text-primary">{formatDuration(activeLectureDetail.duration)}</strong></div>
              <div className="w-px h-3 bg-border-subtle" />
              <div>Word count: <strong className="text-text-primary">{activeLectureDetail.wordCount} words</strong></div>
            </div>

            {/* AI Summary Grid */}
            {activeLectureDetail.summary && (
              <div className="glass-panel p-5 rounded-lg border border-accent-coral/25">
                <div className="flex items-center gap-2 text-accent-coral border-b border-border-subtle pb-2 mb-3">
                  <Brain className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase tracking-wider font-display">AI Lecture Analysis</span>
                </div>
                <div className="space-y-1">
                  {renderMarkdown(activeLectureDetail.summary)}
                </div>
              </div>
            )}

            {/* Original Transcript */}
            <div className="space-y-2">
              <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider border-b border-border-subtle pb-2">
                Captured Lecture Transcript
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed bg-black/10 p-4 rounded-lg border border-border-subtle">
                {activeLectureDetail.transcript}
              </p>
            </div>

            {/* Translated Subtitles */}
            {activeLectureDetail.translatedTranscript && (
              <div className="space-y-2">
                <h4 className="font-bold text-accent-coral-soft text-xs uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
                  <Languages className="w-4 h-4" />
                  Translated Subtitles ({SUPPORTED_LANGUAGES.find(l => l.code === activeLectureDetail.targetLanguage)?.name || activeLectureDetail.targetLanguage})
                </h4>
                <p className="text-xs text-accent-coral-soft/85 leading-relaxed bg-accent-coral/5 p-4 rounded-lg border border-accent-coral/10 italic">
                  {activeLectureDetail.translatedTranscript}
                </p>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 border-t border-border-subtle pt-4 mt-6">
              <Button
                onClick={() => handleExportTxt(activeLectureDetail)}
                variant="ghost"
                size="sm"
                icon={Download}
              >
                Export Notes (.txt)
              </Button>
              <Button
                onClick={() => setActiveLectureDetail(null)}
                variant="primary"
                size="sm"
              >
                Close
              </Button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}
