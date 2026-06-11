/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7C3AED', // brand primary
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Concert status colours
        concert: {
          upcoming: '#3b82f6',   // blue-500
          ongoing:  '#22c55e',   // green-500
          finished: '#6b7280',   // gray-500
        },
        // Order status colours
        order: {
          waiting:   '#eab308', // yellow-500
          paid:      '#22c55e', // green-500
          processed: '#8b5cf6', // violet-500
          done:      '#14b8a6', // teal-500
          cancelled: '#ef4444', // red-500
        },
      },
    },
  },
  plugins: [],
};
