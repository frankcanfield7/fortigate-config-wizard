/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Graphene Networks Brand Colors - Cyan Theme
        'spartan-cyan': {
          light: '#22d3ee',
          DEFAULT: '#06b6d4',
          dark: '#0891b2',
        },
        // Dark Theme Background Colors (matching original HTML)
        'dark-bg': '#0f172a',
        'dark-bg-secondary': '#1e293b',
        'dark-border': '#334155',
        'dark-surface': '#475569',
        // Text Colors
        'text-primary': '#e2e8f0',
        'text-secondary': '#cbd5e1',
        'text-muted': '#94a3b8',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

