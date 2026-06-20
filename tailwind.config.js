/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#F5F1E8',
          100: '#EDE8DA',
          200: '#C9C2B0',
          300: '#8A8578',
          400: '#5A564D',
          500: '#3A3832',
          600: '#2A2A30',
          700: '#22252B',
          800: '#1A1D23',
          900: '#14161A',
          950: '#0E0F12',
        },
        accent: {
          DEFAULT: '#D97757',
          50: '#FBEFE9',
          100: '#F5D9CC',
          200: '#ECB398',
          300: '#E08D67',
          400: '#D97757',
          500: '#C5633F',
          600: '#A34C2D',
          700: '#7C3921',
        },
        success: '#3D6B6B',
        danger: '#B4523E',
        memory: '#E8D5A3',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'polaroid': '0 4px 20px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)',
        'stamp': '0 0 0 2px rgba(217,119,87,0.6), inset 0 0 0 1px rgba(217,119,87,0.4)',
        'soft': '0 8px 30px rgba(0,0,0,0.35)',
      },
      backgroundImage: {
        'paper-texture':
          "radial-gradient(ellipse at top, rgba(232,213,163,0.06), transparent 60%), radial-gradient(ellipse at bottom, rgba(217,119,87,0.04), transparent 60%)",
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        breathe: {
          '0%,100%': { opacity: '0.4' },
          '50%': { opacity: '0.9' },
        },
        'pin-drop': {
          '0%': { transform: 'scale(0) rotate(-30deg)', opacity: '0' },
          '60%': { transform: 'scale(1.2) rotate(5deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0)', opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        breathe: 'breathe 2s ease-in-out infinite',
        'pin-drop': 'pin-drop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
      },
    },
  },
  plugins: [],
};
