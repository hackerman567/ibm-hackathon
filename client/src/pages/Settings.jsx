import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { getStorageStats, clearAllLectures } from '../lib/db';
import { SUPPORTED_LANGUAGES } from '../lib/translate';

import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

import {
  Sliders,
  Eye,
  Cpu,
  Trash2,
  AlertTriangle,
  Moon,
  Sun,
  HardDrive,
  Volume2,
  VolumeX,
  Contrast,
  Zap,
  Bell,
  Gauge,
  Languages,
  CheckCircle2
} from 'lucide-react';

// Reusable toggle component
function SettingToggle({ checked, onChange, id }) {
  return (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-10 h-5 bg-bg-elevated peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-secondary peer-checked:after:bg-accent-coral after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-coral/20 border border-border-subtle transition-all" />
    </label>
  );
}

// Section wrapper
function SettingSection({ icon: Icon, title, children }) {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-2.5 border-b border-border-subtle pb-4">
        <div className="p-1.5 bg-accent-coral/10 rounded-lg">
          <Icon className="w-4 h-4 text-accent-coral" />
        </div>
        <h2 className="font-bold text-text-primary text-sm font-display uppercase tracking-wider">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// Row inside a section
function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="min-w-0">
        <p className="text-xs font-bold text-text-primary">{label}</p>
        {description && <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function Settings() {
  const {
    targetLanguage,
    autoTranslate,
    autoSummarize,
    captionFontSize,
    reduceMotion,
    groqApiKey,
    captionStyle,
    bgOpacity,
    lineSpacing,
    theme,
    notificationSounds,
    highContrast,
    captionSpeed,
    actions
  } = useSettingsStore();

  const [dbStats, setDbStats] = useState({ count: 0, estimatedSizeKB: 0 });
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [localApiKey, setLocalApiKey] = useState(groqApiKey);
  const [keySaved, setKeySaved] = useState(false);

  const loadDbStats = async () => {
    try {
      const stats = await getStorageStats();
      setDbStats(stats);
    } catch (e) {
      console.error('Failed to retrieve storage stats:', e);
    }
  };

  useEffect(() => {
    loadDbStats();
  }, []);

  const handleSaveApiKey = () => {
    actions.setApiKey(localApiKey.trim());
    setKeySaved(true);
    toast.success('AI key saved successfully!');
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleClearDatabase = async () => {
    try {
      await clearAllLectures();
      setDbStats({ count: 0, estimatedSizeKB: 0 });
      setConfirmClearOpen(false);
      toast.success('All saved sessions deleted successfully.');
    } catch (err) {
      toast.error('Failed to clear saved data.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 select-none">

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight font-display">
            Preferences
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Customize captions, translations, appearance, and accessibility settings with live preview
          </p>
        </div>
        {/* Quick Theme Toggle in Header */}
        <button
          onClick={() => {
            actions.toggleTheme();
            toast.success(`Theme changed to ${theme === 'dark' ? 'Light' : 'Dark'} mode`);
          }}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all ${
            theme === 'light'
              ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
              : 'bg-accent-coral/10 border-accent-coral/20 text-accent-coral hover:bg-accent-coral/20'
          }`}
        >
          {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'light' ? 'Light Mode Active' : 'Dark Mode Active'}
        </button>
      </div>

      {/* Live Interactive Caption & Theme Preview Card */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-coral flex items-center gap-2 font-display">
            <Eye className="w-4 h-4" /> Live Caption & Accessibility Preview
          </span>
          <div className="flex items-center gap-2 text-[10px] text-text-secondary font-mono">
            <span>Font: <strong className="text-text-primary uppercase">{captionFontSize}</strong></span>
            <span>•</span>
            <span>Opacity: <strong className="text-text-primary">{bgOpacity}%</strong></span>
            <span>•</span>
            <span>Style: <strong className="text-text-primary uppercase">{captionStyle}</strong></span>
          </div>
        </div>

        {/* Live Rendering Box */}
        <div
          className="rounded-xl p-6 transition-all duration-300 border border-border-subtle/40 min-h-[120px] flex flex-col justify-center"
          style={{ backgroundColor: `rgba(0, 0, 0, ${bgOpacity / 100})` }}
        >
          <div className={`${
            lineSpacing === 'tight' ? 'space-y-1' : lineSpacing === 'normal' ? 'space-y-2' : lineSpacing === 'relaxed' ? 'space-y-4' : 'space-y-6'
          }`}>
            <p className={`font-semibold tracking-wide transition-all ${
              captionFontSize === 'md' ? 'text-xl md:text-2xl' : captionFontSize === 'lg' ? 'text-2xl md:text-3xl' : captionFontSize === 'xl' ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'
            } ${
              captionStyle === 'contrast' ? 'text-white font-extrabold tracking-wider' : 'text-text-primary'
            }`}>
              "Photosynthesis converts sunlight into energy inside plant cells."
            </p>
            {autoTranslate && (
              <p className={`italic ${captionStyle === 'contrast' ? 'text-yellow-400 font-bold' : 'text-accent-coral-soft/90'} ${
                captionFontSize === 'md' ? 'text-base' : captionFontSize === 'lg' ? 'text-lg' : captionFontSize === 'xl' ? 'text-xl' : 'text-2xl'
              }`}>
                "La fotosíntesis convierte la luz solar en energía en las células vegetales."
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ======================================== */}
      {/* Grid: 2 columns on larger screens */}
      {/* ======================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ---- SECTION 1: APPEARANCE ---- */}
        <SettingSection icon={Eye} title="Caption Appearance">
          {/* Font Size */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Caption Font Size</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'md', label: 'Medium' },
                { key: 'lg', label: 'Large' },
                { key: 'xl', label: 'X-Large' },
                { key: '2xl', label: 'Display' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => actions.setCaptionFontSize(key)}
                  className={`py-2 px-1 rounded-lg text-[10px] font-bold border capitalize transition-all ${
                    captionFontSize === key
                      ? 'bg-accent-coral/15 text-accent-coral border-accent-coral/30 shadow-sm'
                      : 'bg-bg-elevated text-text-secondary border-border-subtle hover:text-text-primary hover:border-text-secondary/25'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Caption Style */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Caption Contrast Style</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'standard', label: 'Standard' },
                { key: 'contrast', label: 'High Contrast' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => actions.setCaptionStyle(key)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    captionStyle === key
                      ? 'bg-accent-coral/15 text-accent-coral border-accent-coral/30'
                      : 'bg-bg-elevated text-text-secondary border-border-subtle hover:text-text-primary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Line Spacing */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Caption Line Spacing</p>
            <div className="grid grid-cols-4 gap-2">
              {['tight', 'normal', 'relaxed', 'loose'].map((spacing) => (
                <button
                  key={spacing}
                  onClick={() => actions.setLineSpacing(spacing)}
                  className={`py-2 px-2 rounded-lg text-[10px] font-semibold capitalize border transition-all ${
                    lineSpacing === spacing
                      ? 'bg-accent-coral/15 text-accent-coral border-accent-coral/30'
                      : 'bg-bg-elevated text-text-secondary border-border-subtle hover:text-text-primary'
                  }`}
                >
                  {spacing}
                </button>
              ))}
            </div>
          </div>

          {/* Background Opacity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Caption Background Opacity</p>
              <span className="text-[10px] font-bold text-accent-coral">{bgOpacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={bgOpacity}
              onChange={(e) => actions.setBgOpacity(Number(e.target.value))}
              className="w-full accent-accent-coral h-1.5 rounded-lg cursor-pointer bg-bg-elevated"
            />
            <div className="flex justify-between text-[9px] text-text-muted font-medium">
              <span>Transparent</span><span>Opaque</span>
            </div>
          </div>
        </SettingSection>

        {/* ---- SECTION 2: THEME & INTERFACE ---- */}
        <SettingSection icon={Contrast} title="Theme & Interface">
          <SettingRow label="Dark / Light Mode" description="Switch between dark and light interface themes">
            <button
              onClick={actions.toggleTheme}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition-all ${
                theme === 'light'
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-bg-elevated border-border-subtle text-text-primary'
              }`}
            >
              {theme === 'light' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              {theme === 'light' ? 'Light' : 'Dark'}
            </button>
          </SettingRow>

          <SettingRow label="Reduce Animations" description="Disable intensive page transitions and animated elements">
            <SettingToggle
              id="reduce-motion"
              checked={reduceMotion}
              onChange={actions.toggleReduceMotion}
            />
          </SettingRow>

          <SettingRow label="High Contrast Mode" description="Maximise text contrast for low-vision users">
            <SettingToggle
              id="high-contrast"
              checked={highContrast}
              onChange={actions.toggleHighContrast}
            />
          </SettingRow>

          {/* Caption Speed */}
          <div className="space-y-2 pt-1">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5" /> Caption Speed
            </p>
            <p className="text-[10px] text-text-secondary">Controls how quickly new caption lines appear and scroll</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'slow', label: 'Slow' },
                { key: 'normal', label: 'Normal' },
                { key: 'fast', label: 'Fast' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => actions.setCaptionSpeed(key)}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                    captionSpeed === key
                      ? 'bg-accent-coral/15 text-accent-coral border-accent-coral/30'
                      : 'bg-bg-elevated text-text-secondary border-border-subtle hover:text-text-primary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </SettingSection>

        {/* ---- SECTION 3: TRANSLATION & AI ---- */}
        <SettingSection icon={Languages} title="Translation & AI">
          {/* Default Language Selector */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Default Translation Language</p>
            <p className="text-[10px] text-text-secondary">Captions and summaries translate into this language when enabled</p>
            <select
              value={targetLanguage}
              onChange={(e) => actions.setTargetLanguage(e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-coral transition-colors cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <SettingRow label="Auto-Translate Captions" description="Automatically translate each completed sentence during live sessions">
            <SettingToggle
              id="auto-translate"
              checked={autoTranslate}
              onChange={actions.toggleAutoTranslate}
            />
          </SettingRow>

          <SettingRow label="Auto-Generate Study Notes" description="Automatically create AI study notes when a session ends">
            <SettingToggle
              id="auto-summarize"
              checked={autoSummarize}
              onChange={actions.toggleAutoSummarize}
            />
          </SettingRow>

          {/* AI Key Input */}
          <div className="space-y-2 pt-2 border-t border-border-subtle/50">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Custom AI Key (Optional)</p>
            <div className="flex gap-2">
              <input
                type="password"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="Enter custom key (optional)..."
                className="flex-1 bg-bg-elevated border border-border-subtle hover:border-accent-coral/20 focus:border-accent-coral focus:ring-1 focus:ring-accent-coral/30 rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
              />
              <button
                onClick={handleSaveApiKey}
                className={`px-3 py-2 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  keySaved
                    ? 'bg-success/15 text-success border-success/30'
                    : 'bg-bg-elevated border-border-subtle text-text-secondary hover:text-text-primary hover:border-accent-coral/30'
                }`}
              >
                {keySaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                {keySaved ? 'Saved!' : 'Save Key'}
              </button>
            </div>
            <p className="text-[10px] text-text-muted">If empty, the app uses the built-in shared AI service.</p>
          </div>
        </SettingSection>

        {/* ---- SECTION 4: NOTIFICATIONS & ACCESSIBILITY ---- */}
        <SettingSection icon={Bell} title="Notifications & Alerts">
          <SettingRow label="Sound Notifications" description="Play audio alerts for classroom events like name calls and alarms">
            <SettingToggle
              id="notification-sounds"
              checked={notificationSounds}
              onChange={actions.toggleNotificationSounds}
            />
          </SettingRow>

          <SettingRow label="Sound Visualizer" description="Show the visual sound level meter at the top of the classroom during live speech">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-coral/10 border border-accent-coral/20 rounded-lg">
              <Zap className="w-3.5 h-3.5 text-accent-coral" />
              <span className="text-[10px] font-bold text-accent-coral">Always Active</span>
            </div>
          </SettingRow>

          <div className="pt-2 p-3 bg-bg-elevated rounded-lg border border-border-subtle space-y-2">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> Accessibility Features
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-text-secondary">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                High Contrast Mode
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                Keyboard Friendly
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                Screen Reader Ready
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                Accessibility Approved
              </div>
            </div>
          </div>
        </SettingSection>

        {/* ---- SECTION 5: STORAGE ---- */}
        <div className="lg:col-span-2">
          <SettingSection icon={HardDrive} title="Storage & Session Data">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Stats */}
              <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-text-primary font-display">{dbStats.count}</div>
                <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mt-1">Saved Sessions</div>
              </div>
              <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-text-primary font-display">{dbStats?.estimatedSizeKB != null ? Number(dbStats.estimatedSizeKB).toFixed(1) : '0.0'}</div>
                <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mt-1">Kilobytes Used</div>
              </div>
              <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-success font-display">∞</div>
                <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mt-1">Storage Quota</div>
              </div>

              {/* Clear Data */}
              <div className="sm:col-span-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border-subtle/50">
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Delete All Saved Data</h4>
                  <p className="text-[10px] text-text-secondary mt-0.5">
                    Permanently removes all session archives, AI summaries, and notes from this device
                  </p>
                </div>
                <Button
                  onClick={() => setConfirmClearOpen(true)}
                  disabled={dbStats.count === 0}
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                >
                  Delete All Data
                </Button>
              </div>
            </div>
          </SettingSection>
        </div>

      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={confirmClearOpen} onClose={() => setConfirmClearOpen(false)} title="Delete All Saved Data?">
        <div className="space-y-4">
          <div className="flex gap-3 items-start p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">Caution: Destructive Action</p>
              <p className="text-[10px] leading-relaxed mt-0.5">
                Deleting saved data removes all recorded sessions, translations, and summaries from this device. This cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button onClick={() => setConfirmClearOpen(false)} variant="ghost" size="sm">
              Cancel
            </Button>
            <Button onClick={handleClearDatabase} variant="danger" size="sm">
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
