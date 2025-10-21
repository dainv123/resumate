import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Light mode colors (existing)
        main: {
          DEFAULT: '#55527c',
          50: '#f8f7fc',
          100: '#f0eef8',
          200: '#e1ddf0',
          300: '#cbc4e3',
          400: '#b0a5d2',
          500: '#55527c',
          600: '#4a4570',
          700: '#3e3a5f',
          800: '#332f4e',
          900: '#28243d',
        },
        dark: {
          DEFAULT: '#130f49',
          50: '#f5f4fd',
          100: '#ebe9fb',
          200: '#d7d3f6',
          300: '#b9b2ee',
          400: '#9489e3',
          500: '#6b5dd7',
          600: '#5a47c9',
          700: '#4c3ab0',
          800: '#3f2f91',
          900: '#130f49',
        },
        yellow: {
          DEFAULT: '#ff972d',
          50: '#fff8f0',
          100: '#ffeed6',
          200: '#ffdbac',
          300: '#ffc177',
          400: '#ffa041',
          500: '#ff972d',
          600: '#f0850f',
          700: '#c76b08',
          800: '#9e540c',
          900: '#80450d',
        },
        blue: {
          DEFAULT: '#a5a6ff',
          50: '#f0f0ff',
          100: '#e5e5ff',
          200: '#d1d2ff',
          300: '#a5a6ff',
          400: '#8b8cff',
          500: '#6b6dff',
          600: '#4f51ff',
          700: '#3b3dff',
          800: '#2f31e6',
          900: '#1f21b3',
        },
        // Dark mode specific colors
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        zinc: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        karla: ['Karla', 'sans-serif'],
        kristi: ['Kristi', 'cursive'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'expand': 'expandHeight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        expandHeight: {
          '0%': { maxHeight: '0', opacity: '0' },
          '100%': { maxHeight: '2000px', opacity: '1' },
        },
      },
      boxShadow: {
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        'portfolio': '30px 40px 80px #e4edf5',
        'portfolio-dark': '30px 40px 80px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
