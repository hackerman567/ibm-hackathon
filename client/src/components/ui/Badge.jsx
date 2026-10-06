import React from 'react';

export default function Badge({
  children,
  variant = 'language', // live | language | count
  className = ''
}) {
  const baseStyles = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold';
  
  const variants = {
    live: 'bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider',
    language: 'bg-accent-coral/5 text-accent-coral border border-accent-coral/20',
    count: 'bg-bg-elevated text-text-secondary border border-border-subtle'
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {variant === 'live' && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      )}
      {children}
    </span>
  );
}
