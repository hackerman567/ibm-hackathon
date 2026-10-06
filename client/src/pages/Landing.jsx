import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  LayoutDashboard,
  Mic,
  Languages,
  BookOpen,
  BrainCircuit,
  ShieldCheck,
  HardDrive,
  ChevronRight,
  Accessibility,
  Award,
  Zap,
  Users,
  AudioLines,
  CheckCircle2,
  Shield,
  ArrowRight,
  Sparkles,
  Cpu,
  Globe,
  Lock
} from 'lucide-react';
import AnimatedText from '../components/ui/AnimatedText';
import Button from '../components/ui/Button';
import StatsCard from '../components/ui/StatsCard';
import HeroMeshBackground from '../components/ui/HeroMeshBackground';

export default function Landing() {
  const navigate = useNavigate();
  const [parallaxCoords, setParallaxCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const x = (clientX - width / 2) / 45;
    const y = (clientY - height / 2) / 45;
    setParallaxCoords({ x, y });
  };

  const steps = [
    { num: '01', title: 'Capture Audio', desc: 'Captures live classroom lectures directly from the microphone in real time.' },
    { num: '02', title: 'Stream Captions', desc: 'Converts speech instantly into continuous, high-contrast captions.' },
    { num: '03', title: 'Instant Translate', desc: 'Displays concurrent subtitles in 50+ languages beneath the transcript.' },
    { num: '04', title: 'Generate Notes', desc: 'Produces structured lecture summaries, key terms, and recap bullet points.' },
    { num: '05', title: 'Offline Archive', desc: 'Saves complete transcript histories locally on device for private review.' }
  ];

  const features = [
    {
      icon: Mic,
      title: 'Live Captions',
      desc: 'Real-time speech transcription displayed with customizable font sizes and contrast for effortless reading.'
    },
    {
      icon: Accessibility,
      title: '3D Sign Avatar',
      desc: 'Visual sign language interpreter animated in real time synchronized with teacher speech.'
    },
    {
      icon: Languages,
      title: 'Multi-Language Subtitles',
      desc: 'Concurrent sentence translation supporting 50+ languages right below the primary caption line.'
    },
    {
      icon: BrainCircuit,
      title: 'Smart Study Summaries',
      desc: 'Automated AI note generation detailing main takeaways, definitions, and review questions.'
    },
    {
      icon: HardDrive,
      title: 'Private On-Device Archive',
      desc: 'Full transcript histories remain accessible offline directly from your device browser.'
    },
    {
      icon: ShieldCheck,
      title: 'WCAG 2.1 AA Compliant',
      desc: 'Built to strict accessibility guidelines with high contrast, motion controls, and screen-reader support.'
    }
  ];

  const integrations = [
    { name: 'Web Speech API', icon: Mic, desc: 'Realtime Speech Processing' },
    { name: 'MediaPipe 3D', icon: Accessibility, desc: 'ASL Gesture Rigging' },
    { name: 'Socket.IO Sync', icon: Cpu, desc: 'WebSocket Protocol' },
    { name: 'Groq AI Engine', icon: BrainCircuit, desc: 'Llama 3 Summarization' },
    { name: 'IndexedDB', icon: Lock, desc: 'Private Local Storage' },
    { name: 'Multi-Language Subtitles', icon: Globe, desc: '50+ Languages' },
    { name: 'WebAudio API', icon: Zap, desc: 'Sound Level Meter' },
    { name: 'Framer Motion', icon: Sparkles, desc: 'Smooth Micro-Motion' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#07080C] text-text-primary bg-grid-pattern relative overflow-hidden select-none font-sans"
    >
      {/* Dynamic 60fps Interactive Hero Canvas Background */}
      <HeroMeshBackground />

      {/* Top Ambient Glow Spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent-coral/6 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-2/3 right-10 w-[500px] h-[500px] bg-indigo-600/6 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-28 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Premium SaaS Copy */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 space-y-8 text-center lg:text-left"
          >
            {/* Glossy Pill Badge */}
            <motion.div variants={itemVariants} className="flex justify-center lg:justify-start">
              <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold tracking-wider border border-white/15 bg-white/5 backdrop-blur-xl text-text-primary shadow-xl">
                <Sparkles className="w-3.5 h-3.5 text-accent-coral" />
                <span className="font-mono text-[11px] uppercase tracking-[0.08em]">Next-Gen Assistive Platform</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </span>
            </motion.div>

            {/* Title with Tightened Letter Spacing & Line Height */}
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] text-text-primary leading-[0.95] font-display">
              <AnimatedText text="Real-Time Captions for" delay={0.05} />
              <span className="block mt-3 shimmer-text">Inclusive Education.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-base sm:text-lg text-text-secondary max-w-[52ch] mx-auto lg:mx-0 leading-[1.6] font-normal">
              Signify AI turns spoken lectures into real-time captions, 3D sign language animations, instant multi-language subtitles, and structured study notes.
            </motion.p>

            {/* Glossy Action Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => navigate('/classroom')}
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-bold text-white bg-gradient-to-r from-accent to-[#E63939] hover:opacity-95 shadow-2xl shadow-accent-glow border-t border-white/20 transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98]"
              >
                <span>Start Live Session</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full text-sm font-semibold text-text-primary bg-bg-raised hover:bg-bg-hover border border-border-default backdrop-blur-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <LayoutDashboard className="w-4 h-4 text-text-secondary" />
                <span>View Dashboard</span>
              </button>
            </motion.div>

            {/* Trust feature pills */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
              {['Instant Browser Setup', 'Private On-Device Storage', 'WCAG 2.1 AA Compliant'].map(text => (
                <span key={text} className="flex items-center gap-2 text-xs text-text-secondary font-medium bg-bg-raised border border-border-subtle px-3.5 py-1.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-teal" />
                  {text}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column: Premium Floating Live Caption Preview Glass Box with 3D perspective */}
          <motion.div
            animate={{ x: parallaxCoords.x }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            style={{ perspective: 1000 }}
            className="lg:col-span-5 relative w-full max-w-md mx-auto"
          >
            <div
              style={{ transform: 'rotateY(-4deg) rotateX(2deg)' }}
              className="w-full bg-bg-raised border border-border-subtle hover:border-border-default rounded-3xl shadow-2xl p-6 space-y-5 backdrop-blur-2xl transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_32px_rgba(0,0,0,0.4)]"
            >

              {/* Glass Card Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                  <span className="text-xs uppercase font-bold tracking-wider text-white font-display">Live Lecture Stream</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-accent-blue/15 border border-accent-blue/30 text-accent-blue-soft text-[10px] font-bold uppercase tracking-wider">
                  Spanish Subtitles
                </span>
              </div>

              {/* Real-Time Mock Captions */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-3 min-h-[120px]">
                <p className="text-xs text-text-muted">
                  Welcome class. Today we explore cellular energy transfer...
                </p>
                <p className="text-base text-white font-bold leading-snug font-display">
                  Mitochondria produce ATP through aerobic respiration...
                </p>
                <p className="text-xs text-accent-coral-soft italic font-medium">
                  Las mitocondrias producen ATP mediante respiración aeróbica...
                </p>
              </div>

              {/* AI Summary Brief Box */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-accent-coral">
                  <BrainCircuit className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider font-display">Lesson Summary Brief</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Key Concept: Role of Mitochondria in Cellular ATP Synthesis.
                </p>
              </div>

              {/* Stats Footer */}
              <div className="flex items-center justify-between px-1 text-[11px] text-text-muted font-mono font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-coral" />
                  Continuous Speech Engine
                </span>
                <span>↳ High Precision</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tech Integration Ribbon (Infinite Marquee Ticker) */}
      <section className="py-8 border-y border-white/10 bg-black/40 backdrop-blur-md relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 text-center">
          <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted font-mono">
            Powered by Modern Assistive Tech & Real-Time Engine
          </p>
        </div>
        <div className="relative w-full overflow-hidden flex">
          {/* Gradient masking for seamless fading edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#07080C] to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#07080C] to-transparent z-20 pointer-events-none" />

          {/* Duplicated list for seamless infinite loop */}
          <div className="animate-marquee flex items-center gap-6 py-2">
            {[...integrations, ...integrations].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-bg-raised/80 border border-border-subtle hover:border-accent-coral/30 transition-all shrink-0 group cursor-default shadow-lg"
                >
                  <div className="p-1.5 bg-accent-coral/10 text-accent-coral rounded-lg border border-accent-coral/20 group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold font-display text-text-primary group-hover:text-accent-coral transition-colors whitespace-nowrap block">
                      {item.name}
                    </span>
                    <span className="text-[9px] text-text-tertiary font-mono block whitespace-nowrap">
                      {item.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sign Language Visualizer Feature Canvas */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Avatar Graphic Showcase */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 relative bg-gradient-to-br from-violet-950/40 via-indigo-950/20 to-transparent border border-violet-500/30 rounded-3xl p-8 overflow-hidden flex flex-col items-center justify-center min-h-[300px] shadow-2xl backdrop-blur-xl group hover:border-violet-400/50 transition-all"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-5">
              <div className="w-24 h-24 rounded-full bg-violet-500/20 border-2 border-violet-400/50 flex items-center justify-center shadow-2xl shadow-violet-500/30 group-hover:scale-105 transition-transform duration-300">
                <Accessibility className="w-12 h-12 text-violet-200" />
              </div>
              <div className="text-center space-y-1.5">
                <span className="text-[10px] font-bold text-violet-300 uppercase tracking-widest bg-violet-500/15 px-3.5 py-1 rounded-full border border-violet-500/30">
                  Visual Accessibility Channel
                </span>
                <h3 className="text-lg font-bold text-white font-display mt-2">3D Sign Language Avatar</h3>
                <p className="text-xs text-violet-300/80">Real-time ASL hand signing synced with teacher speech</p>
              </div>
            </div>
          </motion.div>

          {/* Avatar Description & Action */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            <span className="inline-block px-3.5 py-1 text-[10px] font-bold tracking-widest text-violet-300 bg-violet-400/10 border border-violet-400/20 uppercase rounded-full">
              Interactive Sign Visualizer
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-display leading-tight">
              Visual Sign Language for Every Lecture.
            </h2>
            <p className="text-text-secondary text-sm sm:text-base max-w-xl leading-relaxed mx-auto lg:mx-0">
              For students who rely on American Sign Language (ASL), our 3D avatar translates spoken lectures into natural hand gestures directly beside written captions.
            </p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {['Live Speech Sync', 'Adjustable Speed', 'High Contrast Full-Frame'].map(feat => (
                <span key={feat} className="flex items-center gap-1.5 text-xs text-violet-300 bg-violet-500/10 border border-violet-500/20 px-3.5 py-1.5 rounded-full font-medium">
                  <Award className="w-3.5 h-3.5" /> {feat}
                </span>
              ))}
            </div>
            <div className="pt-2 flex justify-center lg:justify-start">
              <button
                onClick={() => navigate('/avatar')}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-2xl shadow-violet-600/30 border border-violet-400/30 transition-all transform hover:scale-[1.03] active:scale-[0.98]"
              >
                <Accessibility className="w-4 h-4" />
                <span>Launch Sign Avatar Engine</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">Bridging the Classroom Gap</h2>
          <p className="text-sm text-text-secondary">Empowering deaf and hard-of-hearing students with equal educational access</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard value={466} suffix="M+" label="Deaf & Hard of Hearing Individuals" icon={Users} />
          <StatsCard value={70} suffix="%" label="Spoken Content Missed without Captions" icon={Mic} />
          <StatsCard value={3} suffix="x" label="Higher Risk of Falling Behind" icon={BookOpen} />
          <StatsCard value={50} suffix="+" label="Subtitle Languages Supported" icon={Languages} />
        </div>
      </section>

      {/* How It Works Pipeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-white/10">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">How Signify AI Works</h2>
          <p className="text-sm text-text-secondary">Five-step automated pipeline built for instant classroom integration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="relative group"
            >
              <div className="glass-panel p-6 rounded-2xl space-y-3 h-full relative z-10 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-accent-coral/40 transition-all duration-300">
                <span className="text-accent-coral font-bold font-display text-2xl">{step.num}</span>
                <h3 className="font-bold text-white text-sm font-display">{step.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{step.desc}</p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -translate-y-1/2 -right-3.5 z-0 text-white/20">
                  <ChevronRight className="w-5 h-5" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Glossy Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-white/10">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">Platform Capabilities</h2>
          <p className="text-sm text-text-secondary">Core accessibility tools designed for student engagement</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                className="glass-panel p-7 rounded-2xl glass-card-hover space-y-4 border border-white/10 hover:border-accent-coral/40 backdrop-blur-xl"
              >
                <div className="p-3 bg-accent-coral/10 text-accent-coral rounded-xl border border-accent-coral/20 w-fit">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white font-display">{feat.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Informative Glossy SaaS Footer */}
      <footer className="relative z-10 bg-[#06070A] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

            {/* Col 1: Brand & Mission */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-accent-coral/10 text-accent-coral rounded-xl border border-accent-coral/20">
                  <AudioLines className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold font-display text-white tracking-wide">
                  SIGNIFY<span className="text-accent-coral">AI</span>
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed max-w-sm">
                Classroom accessibility solution translating live spoken lectures into real-time captions, multi-language subtitles, 3D sign language animations, and structured study notes for deaf and hard-of-hearing students.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/classroom')}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-accent-coral hover:bg-accent-coral/90 transition-all shadow-lg shadow-accent-coral/20"
                >
                  Open Live Classroom
                </button>
                <button
                  onClick={() => navigate('/avatar')}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-text-primary bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all"
                >
                  Sign Avatar Player
                </button>
              </div>
            </div>

            {/* Col 2: Core Platform Capabilities */}
            <div className="md:col-span-4 space-y-3">
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white">
                Core Features
              </h3>
              <ul className="space-y-2.5 text-xs text-text-secondary">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-Time Speech-to-Text Captions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>3D Sign Language Avatar Visualizer</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Smart Name Call & Acoustic Alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automated Study Notes & AI Assistant</span>
                </li>
              </ul>
            </div>

            {/* Col 3: Compliance & Privacy */}
            <div className="md:col-span-3 space-y-3">
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white">
                Accessibility & Privacy
              </h3>
              <ul className="space-y-2.5 text-xs text-text-secondary">
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent-coral shrink-0" />
                  <span>WCAG 2.1 AA Accessibility Compliance</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent-coral shrink-0" />
                  <span>Custom Contrast & Adjustable Typography</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent-coral shrink-0" />
                  <span>Private On-Device Offline Storage</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent-coral shrink-0" />
                  <span>Secure Teacher & Student Session Controls</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-white/10 bg-black/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-text-secondary">
            <div>
              <strong className="text-white font-display">Signify AI Platform</strong> &copy; {new Date().getFullYear()} Inclusive Classroom Accessibility. All rights reserved.
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Deployment Ready
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
