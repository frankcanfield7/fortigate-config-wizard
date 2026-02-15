/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Source Serif 4', 'Georgia', 'serif'],
      },
      colors: {
        dark: {
          bg: '#0c0f14',           // Deep charcoal - refined dark
          surface: '#14181f',      // Elevated surface
          elevated: '#1a1f28',     // Higher elevation
          border: '#252b37',       // Subtle borders
          'border-light': '#323a4a', // Lighter borders for contrast
          text: '#e8e6e3',         // Warm off-white
          muted: '#8a8f98',        // Refined muted text
          accent: '#a39382',       // Warm taupe accent
        },
        status: {
          online: '#5d9e7a',       // Muted sage green
          offline: '#c45c5c',      // Muted terracotta
          degraded: '#c4975c',     // Warm amber
          silenced: '#6b7280',     // Neutral gray
        },
        accent: {
          primary: '#7c9aa6',      // Dusty steel blue
          warm: '#a39382',         // Warm taupe
          cool: '#8a9cab',         // Cool slate
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-subtle': 'linear-gradient(135deg, var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'inner-glow': 'inset 0 1px 0 0 rgba(255,255,255,0.03)',
        'elevated': '0 4px 24px -4px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
        'card': '0 2px 12px -2px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        glow: {
          '0%': { boxShadow: '0 0 0 0 rgba(124, 154, 166, 0)' },
          '100%': { boxShadow: '0 0 8px 2px rgba(124, 154, 166, 0.15)' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
