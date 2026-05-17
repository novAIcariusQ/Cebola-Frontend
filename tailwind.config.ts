import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17211d',
        onion: '#6b8f3f',
        market: '#1f6f64',
        paper: '#f7f5ef',
        clay: '#c25f3f',
      },
      boxShadow: {
        soft: '0 12px 40px rgba(23, 33, 29, 0.08)',
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
