/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'float-up': {
          '0%': { 
            transform: 'translateY(20px) scale(0.8)',
            opacity: 0
          },
          '20%': {
            transform: 'translateY(0) scale(1)',
            opacity: 1
          },
          '80%': {
            transform: 'translateY(0) scale(1)',
            opacity: 1
          },
          '100%': { 
            transform: 'translateY(-20px) scale(0.8)',
            opacity: 0
          },
        },
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        }
      },
      animation: {
        'float-up': 'float-up 2s ease-in-out forwards',
        'pulse-scale': 'pulse-scale 2s ease-in-out infinite',
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')
  ],
}