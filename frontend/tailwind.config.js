/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#fff7f3',
        blush: '#f7dfe9',
        blushDeep: '#e9b4c8',
        blueMist: '#dfeaf8',
        butter: '#f9efbd',
        sage: '#dfe9d8',
        cocoa: '#7d5a45',
        ink: '#2c1e1f',
      },
      boxShadow: {
        soft: '0 18px 40px rgba(64, 42, 45, 0.08)',
      },
      fontFamily: {
        display: ['"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
