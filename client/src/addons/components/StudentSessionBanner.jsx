import React, { useState } from 'react';
import { Key, Shield, Radio, Check, Copy, LogOut, Sparkles, UserCheck } from 'lucide-react';
import { useAddons } from '../context/AddonsContext';

export default function StudentSessionBanner() {
  const { role, activeSession, joinClassSession, leaveClassSession } = useAddons();
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // If user is hosting as teacher, TeacherControlPanel already handles session creation & code display
  if (role === 'teacher' && activeSession) return null;

  const handleJoin = async (e) => {
    e.preventDefault();
    const cleanCode = joinCodeInput.trim().toUpperCase();
    if (!cleanCode) return;
    setLoading(true);
    try {
      await joinClassSession(cleanCode);
      setJoinCodeInput('');
    } catch (err) {
      // Error toasted in context
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!activeSession?.joinCode) return;
    navigator.clipboard.writeText(activeSession.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full mb-4">
      {activeSession ? (
        /* Connected Session Status Banner */
        <div className="bg-gradient-to-r from-accent-teal/10 via-bg-surface to-accent-coral/10 border border-accent-teal/30 rounded-2xl p-4 shadow-lg backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-accent-teal/20 text-accent-teal border border-accent-teal/40 shrink-0">
              <Radio className="w-5 h-5 text-accent-teal" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-bg-surface" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-teal">Connected to Class Session</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Syncing
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-text-secondary">Session Join Code:</span>
                <strong className="font-mono text-sm tracking-widest text-text-primary uppercase font-bold">
                  {activeSession.joinCode}
                </strong>
                <button
                  onClick={handleCopyCode}
                  title="Copy session code"
                  className="p-1 text-text-tertiary hover:text-accent-teal transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={leaveClassSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-elevated hover:bg-red-500/10 border border-border-subtle text-text-secondary hover:text-red-400 text-xs font-semibold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave Session</span>
            </button>
          </div>
        </div>
      ) : (
        /* Join Session Card for Student Access */
        <div className="bg-bg-surface border border-border-subtle hover:border-accent-teal/40 rounded-2xl p-5 shadow-xl transition-all relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-accent-teal/5 rounded-full blur-2xl group-hover:bg-accent-teal/10 transition-all pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            {/* Title & Info */}
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-accent-teal/10 text-accent-teal border border-accent-teal/20">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold font-display text-text-primary tracking-wide">
                  Student Session Access
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-bg-elevated text-text-tertiary border border-border-subtle">
                  Join Teacher
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Enter the 6-character classroom code provided by your instructor (e.g. <strong className="font-mono text-accent-teal">GJGY6F</strong>) to receive real-time captions, emphasis badges, and teacher alerts.
              </p>
            </div>

            {/* Code Input Form */}
            <form onSubmit={handleJoin} className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. GJGY6F"
                  className="w-36 text-center tracking-widest uppercase font-mono text-sm font-bold py-2.5 px-3 bg-bg-elevated border border-border-subtle rounded-xl text-accent-teal focus:outline-none focus:border-accent-teal focus:ring-2 focus:ring-accent-teal/20 placeholder:text-text-muted transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !joinCodeInput.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-accent-teal to-teal-500 hover:from-accent-teal/90 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-bg-base font-bold text-xs rounded-xl shadow-lg shadow-accent-teal/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? 'Joining...' : 'Join Session'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
