import React, { useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useSettingsStore } from '../../store/useSettingsStore';

export default function Layout() {
  const location = useLocation();
  const { reduceMotion } = useSettingsStore();
  const isLanding = location.pathname === '/';
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log('Background video autoplay handled:', err);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-bg-base flex flex-col selection:bg-accent-coral/25 selection:text-text-primary text-text-primary relative overflow-hidden">
      {/* Persistent Global Ambient Video Background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          src="/bg-video.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B]/85 via-[#0A0A0B]/70 to-[#0A0A0B]" />
      </div>

      {/* Top Navbar */}
      <div className="relative z-30">
        <Navbar />
      </div>

      {/* Content wrapper */}
      <div className="flex-1 flex relative z-10">
        {/* Sidebar - Collapsed/expanded left rail, only on non-landing pages */}
        {!isLanding && <Sidebar />}

        {/* Main section */}
        <main className={`flex-1 min-w-0 ${!isLanding ? 'md:pl-16' : ''}`}>
          <div key={location.pathname} className="w-full h-full animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
