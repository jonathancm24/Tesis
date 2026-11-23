/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        clinical: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        teal: {
          50: '#effefb',
          100: '#c7fff4',
          200: '#90feeb',
          300: '#4df5de',
          400: '#16dfd0',
          500: '#04c6b8',
          600: '#00a39a',
          700: '#05807c',
          800: '#0a6563',
          900: '#0d5353',
        },
        gum: {
          100: '#fde7ec',
          200: '#fbcdd7',
          300: '#f7a8bb',
          400: '#ef7f99',
          500: '#e2587c',
          600: '#c93a63',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
};
