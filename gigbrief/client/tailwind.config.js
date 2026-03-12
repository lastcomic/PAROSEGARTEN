/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gb: {
          base: '#0a0a0f',
          card: '#111118',
          panel: '#1a1a24',
          border: '#2a2a3a',
          muted: '#6b7280',
          text: '#e5e7eb',
          blue: '#3b82f6',
          amber: '#f59e0b',
          red: '#ef4444',
          green: '#22c55e',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
