const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      black: '#171717',
      white: '#F3F3F3',
      primary: '#94B0DA',
      gray: '#4A4A4A',
      success: '#00FF85',
      error: '#FF0000',
      warning: '#FFD600',
      transparent: 'transparent',
      current: 'currentColor',
    },
    fontFamily: {
      sans: ['Clash Grotesk', 'sans-serif'],
      serif: ['YoungSerif', 'serif'],
    },
    extend: {
      screens: {
        pwa: { raw: '(display-mode: standalone)' },
        browser: { raw: '(display-mode: browser)' },
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        18: '4.75rem',
      },
      animation: {
        'spin-reverse': 'spin-reverse 1s linear infinite',
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant('ios', '@supports (-webkit-touch-callout: none)');
    }),
  ],
};
