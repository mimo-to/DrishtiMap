/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5', // Indigo-600 (Action)
          hover: '#4338ca',   // Indigo-700
          light: '#e0e7ff',   // Indigo-100
        },
        secondary: {
          DEFAULT: '#64748b', // Slate-500 (Neutral)
          hover: '#475569',   // Slate-600
          light: '#f1f5f9',   // Slate-100
        },
        success: '#10b981',   // Emerald-500
        danger: '#ef4444',    // Red-500
        background: '#f9fafb', // Gray-50
        surface: '#ffffff',    // White
      }
    },
  },
  plugins: [],
}
