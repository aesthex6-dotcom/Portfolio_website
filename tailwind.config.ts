import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // rgb(<var> / alpha) keeps opacity modifiers (bg-x/50) working with CSS vars.
        ground: 'rgb(var(--bg-rgb) / <alpha-value>)',
        soft: 'rgb(var(--bg-soft-rgb) / <alpha-value>)',
        surface: 'rgb(var(--surface-rgb) / <alpha-value>)',
        raised: 'rgb(var(--raised-rgb) / <alpha-value>)',
        edge: 'var(--line)',
        'edge-strong': 'var(--line-strong)',
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
        accent2: 'rgb(var(--accent-2-rgb) / <alpha-value>)',
        accent3: 'rgb(var(--accent-3-rgb) / <alpha-value>)',
        ink: 'rgb(var(--text-rgb) / <alpha-value>)',
        muted: 'rgb(var(--muted-rgb) / <alpha-value>)',
        faint: 'rgb(var(--faint-rgb) / <alpha-value>)',
        ok: 'rgb(var(--ok-rgb) / <alpha-value>)',
        warn: 'rgb(var(--warn-rgb) / <alpha-value>)',
        // Explicit palette tokens for intentional combinations
        slate: {
          DEFAULT: '#283845',
          deep: '#1e2a34',
          light: '#30455a',
        },
        amber: {
          DEFAULT: '#FFA649',
          soft: '#ffc07a',
          deep: '#e8952f',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        hero: ['var(--font-hero)', 'system-ui', 'sans-serif'],
        chorus: ['var(--font-hero)', 'system-ui', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: 'var(--line)',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,166,73,0.10) inset',
        glow: '0 0 0 1px rgba(255,166,73,0.35), 0 8px 40px -8px rgba(255,166,73,0.45)',
        'glow-2': '0 0 0 1px rgba(255,166,73,0.30), 0 8px 40px -8px rgba(255,166,73,0.40)',
        lift: '0 30px 80px -30px rgba(0,0,0,0.8)',
      },
      // One calm duration for the default interaction.
      transitionDuration: {
        DEFAULT: '300ms',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(rgba(255,166,73,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,166,73,0.05) 1px, transparent 1px)',
        'dot-grid': 'radial-gradient(rgba(255,166,73,0.07) 1px, transparent 1px)',
      },
      keyframes: {
        blink: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0' } },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'orbit-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        flow: { to: { strokeDashoffset: '-32' } },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        'gradient-x': 'gradient-x 6s ease infinite',
        shimmer: 'shimmer 1.6s ease infinite',
        scan: 'scan 5s linear infinite',
        'orbit-spin': 'orbit-spin 20s linear infinite',
        marquee: 'marquee 32s linear infinite',
        flow: 'flow 1.6s linear infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
