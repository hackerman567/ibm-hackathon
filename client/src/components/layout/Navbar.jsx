import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioLines, Menu, X, Radio } from 'lucide-react';
import { useCaptionStore } from '../../store/useCaptionStore';
import { AddonNavbarEntry } from '../../addons';

export default function Navbar() {
  const { isListening } = useCaptionStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Classroom', path: '/classroom' },
    { name: 'Sign Avatar', path: '/avatar' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'History', path: '/history' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-bg-base/85 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-accent-coral/10 text-accent-coral rounded-lg border border-accent-coral/20 group-hover:bg-accent-coral group-hover:text-bg-base transition-all duration-300">
              <AudioLines className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold font-display text-text-primary tracking-wide">
              SIGNIFY<span className="text-accent-coral">AI</span>
            </span>
          </NavLink>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `relative px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
                        isActive ? 'text-accent-coral' : 'text-text-secondary hover:text-text-primary'
                      }`
                    }
                  >
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavbarTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-coral"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Session Indicator */}
            {isListening && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                <Radio className="w-4 h-4 text-red-500" />
                <span>Recording Live</span>
              </div>
            )}

            {/* Addon Entry Point */}
            <AddonNavbarEntry />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            {isListening && (
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface border border-transparent hover:border-border-subtle border"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden border-b border-border-subtle bg-bg-surface"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-lg text-base font-semibold transition-all ${
                      isActive
                        ? 'bg-accent-coral/10 text-accent-coral border-l-2 border-accent-coral'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                    }`}
                  >
                    {item.name}
                  </NavLink>
                );
              })}
              {isListening && (
                <div className="flex items-center gap-2 px-4 py-3 mx-4 rounded-lg bg-red-500/10 text-red-400 text-sm font-semibold">
                  <span className="inline-block rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  <span>Recording Live</span>
                </div>
              )}
              <div className="pt-2 border-t border-border-subtle px-4">
                <AddonNavbarEntry />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
