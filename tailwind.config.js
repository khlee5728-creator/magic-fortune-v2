/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        magic: ['Cinzel', 'serif'],
        body: ['Nunito', 'sans-serif'],
      },
      colors: {
        magic: {
          dark: '#0d0821',
          deep: '#1a0b3d',
          purple: '#2d1b69',
          violet: '#7c3aed',
          light: '#a78bfa',
          gold: '#f5c518',
          amber: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
}
