/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Dark "editing suite" palette with a tropical accent
        background: '#0A0E14',
        surface: '#141A24',
        'surface-2': '#1C2432',
        border: '#26303F',
        foreground: '#F3F6FA',
        muted: '#8A94A6',
        accent: '#2DD4BF',
        'accent-foreground': '#05201C',
        danger: '#F87171',
      },
      fontFamily: {
        sans: ['Poppins-SemiBold'],
      },
    },
  },
  plugins: [],
};
