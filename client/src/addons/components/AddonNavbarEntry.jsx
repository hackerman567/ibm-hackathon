import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserCheck, Shield, LogOut, Key, Sparkles } from 'lucide-react';
import { useAddons } from '../context/AddonsContext';

export default function AddonNavbarEntry() {
  const { user, role, logout, isAuthModalOpen, setIsAuthModalOpen, activeSession, createClassSession, joinClassSession } = useAddons();
  const navigate = useNavigate();
  const [joinInput, setJoinInput] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleStartSession = async () => {
    try {
      await createClassSession();
      navigate('/classroom');
    } catch (e) {}
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinInput.trim()) return;
    try {
      await joinClassSession(joinInput.trim());
      setShowJoinModal(false);
      setJoinInput('');
      navigate('/classroom');
    } catch (err) {
      // Toast handles error message
    }
  };

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <div className="flex items-center gap-2">
          {/* Active Session Info */}
          {activeSession ? (
            <div
              onClick={() => navigate('/classroom')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-teal/10 hover:bg-accent-teal/20 border border-accent-teal/20 text-accent-teal text-xs font-bold cursor-pointer transition-all"
            >
              <span>Class Code: <strong className="font-mono text-sm tracking-wider">{activeSession.joinCode}</strong></span>
            </div>
          ) : role === 'teacher' ? (
            <button
              onClick={handleStartSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-coral/10 hover:bg-accent-coral/20 border border-accent-coral/30 text-accent-coral text-xs font-bold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start Class Session</span>
            </button>
          ) : (
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-teal/10 hover:bg-accent-teal/20 border border-accent-teal/30 text-accent-teal text-xs font-bold transition-all"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Join Class</span>
            </button>
          )}

          {/* User Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bg-surface border border-border-subtle text-text-primary text-xs font-semibold">
            {role === 'teacher' ? <Shield className="w-3.5 h-3.5 text-accent-teal" /> : <UserCheck className="w-3.5 h-3.5 text-accent-coral" />}
            <span className="max-w-[100px] truncate">{user.name}</span>
            <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated font-mono text-text-tertiary">
              {role}
            </span>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-text-tertiary hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {!activeSession && (
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-teal/10 hover:bg-accent-teal/20 border border-accent-teal/30 text-accent-teal text-xs font-bold transition-all"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Join Class</span>
            </button>
          )}

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-accent-coral/10 to-accent-teal/10 hover:from-accent-coral/20 hover:to-accent-teal/20 border border-accent-coral/30 text-text-primary text-xs font-bold transition-all shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5 text-accent-coral" />
            <span>Sign In</span>
          </button>
        </div>
      )}

      {/* Join Session Modal via Portal */}
      {showJoinModal && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="relative w-full max-w-sm transform overflow-hidden rounded-2xl bg-bg-surface border border-border-subtle p-6 text-left align-middle shadow-2xl transition-all my-8 text-text-primary space-y-4">
              <h3 className="text-lg font-bold font-display">Join Class Session</h3>
              <p className="text-xs text-text-secondary">Enter the 6-character code provided by your teacher:</p>
              <form onSubmit={handleJoin} className="space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  value={joinInput}
                  onChange={e => setJoinInput(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123"
                  className="w-full text-center tracking-widest uppercase font-mono text-lg font-bold py-2 bg-bg-elevated border border-border-subtle rounded-xl text-accent-teal focus:outline-none focus:border-accent-teal"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="px-3 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-accent-teal text-bg-base font-bold text-xs rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Join Session
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
