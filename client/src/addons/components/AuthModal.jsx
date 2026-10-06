import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCheck, Shield, KeyRound, Mail, User, Sparkles } from 'lucide-react';
import { useAddons } from '../context/AddonsContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAddons();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('student'); // 'teacher' | 'student'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [aliases, setAliases] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const aliasArray = aliases ? aliases.split(',').map(a => a.trim()).filter(Boolean) : [];
        await register({ name, email, password, role, aliases: aliasArray });
      } else {
        await login(email, password);
      }
      onClose();
      // Seamless navigation to classroom after authentication
      navigate('/classroom');
    } catch (err) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const modalJSX = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-bg-surface border border-border-subtle p-6 text-left align-middle shadow-2xl transition-all my-8 text-text-primary"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors z-10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pr-6">
              <div className="p-2.5 rounded-xl bg-accent-coral/10 text-accent-coral border border-accent-coral/20 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary">
                  {isRegister ? 'Create Smart Account' : 'Sign in to Signify Smart'}
                </h2>
                <p className="text-xs text-text-secondary">
                  Access tone captions, real-time alerts & classroom roles
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  {/* Role Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">Select Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('student')}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                          role === 'student'
                            ? 'bg-accent-coral/10 text-accent-coral border-accent-coral'
                            : 'bg-bg-elevated text-text-secondary border-border-subtle hover:border-border-default'
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Student</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('teacher')}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                          role === 'teacher'
                            ? 'bg-accent-teal/10 text-accent-teal border-accent-teal'
                            : 'bg-bg-elevated text-text-secondary border-border-subtle hover:border-border-default'
                        }`}
                      >
                        <Shield className="w-4 h-4" />
                        <span>Teacher</span>
                      </button>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-text-tertiary" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full pl-9 pr-3 py-2 bg-bg-elevated border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent-coral"
                      />
                    </div>
                  </div>

                  {role === 'student' && (
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">
                        Nicknames / Aliases (comma separated for Name Detection)
                      </label>
                      <input
                        type="text"
                        value={aliases}
                        onChange={e => setAliases(e.target.value)}
                        placeholder="Janie, J-Doe, Janey"
                        className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent-coral"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-text-tertiary" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-bg-elevated border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent-coral"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 w-4 h-4 text-text-tertiary" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-bg-elevated border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent-coral"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-accent-coral text-bg-base font-bold rounded-xl text-sm hover:opacity-90 transition-opacity shadow-lg shadow-accent-coral/20"
              >
                {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                className="text-xs text-accent-coral font-semibold hover:underline"
              >
                {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalJSX, document.body);
}
