import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0a0a0a',
        surface: '#ffffff',
        muted: '#f6f5f1',
        line: '#ececea',
        ink: '#1a1a1a',
        sub: '#6b6b6b',
        lime: {
          50: '#f3ffe2',
          100: '#e3ffb8',
          200: '#caff7a',
          300: '#b3ff42',
          400: '#9cf520',
          500: '#7fd900',
          600: '#5fa600',
          700: '#1a1a1a',
        },
        rust: '#e8501a',
        // Legacy aliases — старые классы продолжат работать
        onion: '#6b8f3f',
        market: '#1f6f64',
        paper: '#f7f5ef',
        clay: '#c25f3f',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
        '3xl': '28px',
      },
      boxShadow: {
        flat: '0 1px 0 rgba(10,10,10,0.04), 0 1px 3px rgba(10,10,10,0.04)',
        pop: '0 12px 32px -12px rgba(10,10,10,0.18)',
        soft: '0 12px 40px rgba(23, 33, 29, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
