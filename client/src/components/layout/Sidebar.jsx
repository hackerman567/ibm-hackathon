import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, LayoutDashboard, Video, History, Settings, HelpCircle, Hand } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function Sidebar() {
  const location = useLocation();
  const [helpOpen, setHelpOpen] = useState(false);

  const menuItems = [
    { name: 'Home', path: '/', icon: Home, tooltip: 'Home & Project Overview' },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, tooltip: 'Overview & Study Stats' },
    { name: 'Classroom', path: '/classroom', icon: Video, tooltip: 'Live Captions & Classroom Assistant' },
    { name: 'Sign Avatar', path: '/avatar', icon: Hand, tooltip: 'Sign Language Interpreter' },
    { name: 'History', path: '/history', icon: History, tooltip: 'Saved Lecture Notes' },
    { name: 'Settings', path: '/settings', icon: Settings, tooltip: 'Preferences & Display Options' },
  ];

  return (
    <>
      <aside className="hidden md:flex flex-col fixed left-0 top-16 bottom-0 z-40 w-16 hover:w-56 bg-bg-raised/95 backdrop-blur-md border-r border-border-subtle transition-all duration-300 group shadow-xl overflow-hidden select-none">
        {/* Navigation Section */}
        <nav className="flex-1 py-4 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.name}
                to={item.path}
                title={item.tooltip}
                className={`flex items-center h-12 px-3.5 mx-1.5 rounded-xl transition-all relative ${
                  isActive 
                    ? 'text-accent bg-accent-dim font-bold border border-border-subtle' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-overlay'
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 transition-colors" />
                </div>
                <span className="ml-3 text-xs font-bold font-display tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {item.name}
                </span>

                {/* Left Active Rail with Framer Motion layoutId */}
                {isActive && (
                  <motion.div 
                    layoutId="activeRail"
                    className="absolute left-0 top-2 bottom-2 w-[2px] bg-accent rounded-r-full" 
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Help */}
        <div className="p-2 border-t border-border-subtle">
          <button
            onClick={() => setHelpOpen(true)}
            className="flex items-center w-full h-12 px-3.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all focus:outline-none"
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="ml-3 text-xs font-bold font-display tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Help & Tips
            </span>
          </button>
        </div>
      </aside>

      {/* Help Modal */}
      <Modal isOpen={helpOpen} onClose={() => setHelpOpen(false)} title="Signify AI Help & Documentation">
        <div className="space-y-4">
          <p className="text-text-primary font-semibold">Welcome to Signify AI!</p>
          <p>This application is built as a classroom companion for deaf and hard-of-hearing students. Here is how to get the most out of it:</p>
          
          <div className="space-y-3 mt-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded bg-accent-coral/10 text-accent-coral flex items-center justify-center shrink-0 text-xs font-bold">1</div>
              <div>
                <strong className="text-text-primary">Microphone Streaming</strong>
                <p className="text-xs text-text-secondary mt-0.5">Go to the Classroom page, click "Start Session", and grant microphone access. Speech will be transcribed word-by-word.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded bg-accent-coral/10 text-accent-coral flex items-center justify-center shrink-0 text-xs font-bold">2</div>
              <div>
                <strong className="text-text-primary">Try Demo Mode</strong>
                <p className="text-xs text-text-secondary mt-0.5">Click the "Try Demo" button on the classroom control panel. It instantly simulates an active classroom session with live captions.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded bg-accent-coral/10 text-accent-coral flex items-center justify-center shrink-0 text-xs font-bold">3</div>
              <div>
                <strong className="text-text-primary">Real-time Translations</strong>
                <p className="text-xs text-text-secondary mt-0.5">Select your native language and turn on "Auto-Translate". The system translates each completed sentence after a brief speech pause.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded bg-accent-coral/10 text-accent-coral flex items-center justify-center shrink-0 text-xs font-bold">4</div>
              <div>
                <strong className="text-text-primary">AI Lecture Tutor & Summary</strong>
                <p className="text-xs text-text-secondary mt-0.5">Click "Generate Summary" at the end of a lecture to review key concepts. Use the chat input to ask the AI tutor specific questions about the lecture material.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => setHelpOpen(false)} variant="primary" size="sm">
              Got it, thanks!
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
