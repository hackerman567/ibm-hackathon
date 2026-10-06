/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0A0A0B',
        'bg-raised': '#111113',
        'bg-overlay': '#17171A',
        'bg-hover': '#1D1D21',
        'bg-surface': '#111113',
        'bg-elevated': '#17171A',
        
        'border-subtle': 'rgba(255, 255, 255, 0.06)',
        'border-default': 'rgba(255, 255, 255, 0.10)',
        
        'accent': '#FF4D4D',
        'accent-hover': '#FF6B6B',
        'accent-dim': 'rgba(255, 77, 77, 0.12)',
        'accent-glow': 'rgba(255, 77, 77, 0.35)',
        'accent-coral': '#FF4D4D',
        'accent-coral-soft': '#FF6B6B',

        'accent-teal': '#4DD4C0',
        'accent-teal-dim': 'rgba(77, 212, 192, 0.12)',
        'accent-blue': '#0F62FE',
        'accent-blue-soft': '#4589FF',

        'text-primary': '#F5F3EF',
        'text-secondary': 'rgba(245, 243, 239, 0.62)',
        'text-tertiary': 'rgba(245, 243, 239, 0.38)',
        'text-muted': 'rgba(245, 243, 239, 0.38)',
        
        'success': '#4DD4C0',
        'warning': '#FB923C',
      },
      fontFamily: {
        sans: ['"Inter"', '"Geist"', 'sans-serif'],
        display: ['"Syne"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'waveform': 'waveform 1.2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'shimmer': 'shimmer 2.5s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 77, 77, 0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(255, 77, 77, 0.3)' },
        },
        'waveform': {
          '0%, 100%': { transform: 'scaleY(0.2)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
