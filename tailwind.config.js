/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dry: { 100: '#34d399', 70: '#fbbf24', 40: '#f97316', 10: '#ef4444' },
      },
    },
  },
  plugins: [],
};
