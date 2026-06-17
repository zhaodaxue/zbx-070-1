/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ocean: {
          50: '#eef6fb',
          100: '#d9ecf5',
          200: '#b3d8eb',
          300: '#7fb9d9',
          400: '#4693c0',
          500: '#1f72a3',
          600: '#0f5b87',
          700: '#0f3b57',
          800: '#11344a',
          900: '#122d40',
          950: '#0b1e2c',
        },
        coral: {
          50: '#fff4f0',
          100: '#ffe5d9',
          200: '#ffc6b2',
          300: '#ff9e80',
          400: '#ff6b4a',
          500: '#fa4a22',
          600: '#e73010',
          700: '#c22210',
          800: '#9f1f14',
          900: '#831e16',
          950: '#470a08',
        },
        cream: {
          50: '#fdfbf7',
          100: '#faf6f0',
          200: '#f3eadb',
          300: '#e9d9bf',
          400: '#ddc29d',
          500: '#d1a97b',
          600: '#c69265',
          700: '#a57651',
          800: '#866046',
          900: '#6e503b',
          950: '#3a281d',
        },
        success: '#2d5a3d',
        danger: '#b33a3a',
      },
      fontFamily: {
        kai: ['"LXGW WenKai"', '"霞鹜文楷"', 'KaiTi', '"STKaiti"', 'serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(15, 59, 87, 0.08), 0 8px 24px rgba(15, 59, 87, 0.06)',
        cardHover: '0 4px 12px rgba(15, 59, 87, 0.12), 0 16px 40px rgba(15, 59, 87, 0.10)',
      },
    },
  },
  plugins: [],
};
