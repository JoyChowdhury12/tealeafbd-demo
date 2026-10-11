/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: {
        leaf: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d' },
        ink: { 900: '#0b1410', 800: '#111c17', 700: '#16231d' },
      },
      boxShadow: { soft: '0 8px 30px rgba(22, 101, 52, 0.08)', card: '0 1px 2px rgba(16,24,20,.04), 0 8px 24px rgba(16,24,20,.06)' },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: { fadeUp: 'fadeUp .5s ease-out both' },
    },
  },
  plugins: [],
}
