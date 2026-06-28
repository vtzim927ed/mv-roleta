/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyan: {
          glow: '#00F5FF',
          light: '#67E8F9',
          mid: '#22D3EE',
          dark: '#0891B2',
          deep: '#164E63',
        },
        dark: {
          900: '#020B0F',
          800: '#041218',
          700: '#061A24',
          600: '#0A2333',
          500: '#0D2E42',
        }
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(0, 245, 255, 0.5), 0 0 60px rgba(0, 245, 255, 0.2)',
        'cyan-glow-lg': '0 0 40px rgba(0, 245, 255, 0.6), 0 0 100px rgba(0, 245, 255, 0.3)',
        'cyan-inner': 'inset 0 0 30px rgba(0, 245, 255, 0.1)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 245, 255, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 245, 255, 0.8), 0 0 80px rgba(0, 245, 255, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        }
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)',
        'cyan-gradient': 'linear-gradient(135deg, #00F5FF 0%, #0891B2 50%, #164E63 100%)',
        'dark-gradient': 'linear-gradient(180deg, #020B0F 0%, #041218 50%, #020B0F 100%)',
      }
    },
  },
  plugins: [],
}
