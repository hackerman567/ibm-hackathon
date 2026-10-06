import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Copy, ExternalLink, Sparkles, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RyloAvatarViewer({ isSigning, currentWord = '', textToSign = '', targetSignLang = 'ASL' }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAndSync = () => {
    const textToCopy = textToSign || currentWord || 'Photosynthesis converts sunlight into energy';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success(`Copied to clipboard! Paste directly into Rylo Web Engine`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full min-h-[420px] relative overflow-hidden rounded-xl bg-slate-950 flex flex-col justify-between border border-border-subtle/50 select-none">

      {/* Background/Embedded Rylo Webpage with CSS Crop */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-white">
        <iframe
          src="https://rylo.com/sign/translate/"
          title="Rylo Sign Avatar Engine"
          onLoad={() => setIframeLoaded(true)}
          onError={() => setIframeError(true)}
          className="absolute border-0 pointer-events-auto transition-opacity duration-500"
          style={{
            width: '100%',
            height: '100%',
            top: '0',
            left: '0',
            opacity: iframeLoaded ? 1 : 0.4,
          }}
          allow="camera; microphone; autoplay; clipboard-write; encrypted-media"
        />
      </div>

      {/* Top Banner Overlay Badge & Direct Text Sync Button */}
      <div className="relative z-20 p-3.5 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">
          <span className={`w-2.5 h-2.5 rounded-full ${isSigning ? 'bg-emerald-400' : 'bg-accent-coral'}`} />
          <span className="text-[11px] font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Sign Engine ({targetSignLang})
          </span>
        </div>

        {/* Sync Text Button */}
        <button
          onClick={handleCopyAndSync}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-coral hover:bg-accent-coral/90 text-bg-base font-bold text-xs rounded-lg shadow-lg transition-all cursor-pointer z-30"
          title="Copy current input text to paste into Rylo"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy Text for Sign Engine'}</span>
        </button>
      </div>

      {/* Bottom Text Sync Bar */}
      <div className="relative z-20 p-3 bg-black/80 backdrop-blur-md border-t border-white/10 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 truncate">
          <span className="text-[10px] font-bold text-accent-coral uppercase tracking-wider shrink-0">Current Sign Text:</span>
          <span className="text-white font-mono font-bold truncate">
            {textToSign ? `"${textToSign}"` : currentWord ? `[${currentWord}]` : 'Type text on left panel to translate...'}
          </span>
        </div>

        <a
          href="https://rylo.com/sign/translate/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] font-bold text-text-secondary hover:text-accent-coral transition-colors shrink-0"
        >
          <span>Open Direct Link</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Center Loading Indicator */}
      {!iframeLoaded && !iframeError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm text-center p-6 space-y-3 pointer-events-none">
          <RefreshCw className="w-8 h-8 text-accent-coral animate-spin" />
          <p className="text-xs font-bold text-white tracking-wide">Initializing Rylo Avatar Engine...</p>
          <p className="text-[10px] text-gray-400">Rendering sign language visualizer</p>
        </div>
      )}

    </div>
  );
}
