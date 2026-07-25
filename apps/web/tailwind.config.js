const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/shared/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gs: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        surface: {
          base: '#000000',
          raised: '#292929',
          strong: '#1f1f1f',
        },
      },
      fontFamily: {
        sans: [
          'Hind Siliguri',
          'Inter',
          'Helvetica Neue',
          'helvetica',
          'arial',
          'Hiragino Sans',
          'Hiragino Kaku Gothic ProN',
          'Meiryo',
          'MS Gothic',
          'sans-serif',
        ],
      },
      fontSize: {
        'gs-xs': '13.33px',
        'gs-sm': '14px',
        'gs-md': '14.4px',
        'gs-lg': '16px',
        'gs-xl': '24px',
        'gs-2xl': '40px',
      },
      spacing: {
        'gs-1': '2px',
        'gs-2': '4px',
        'gs-3': '8px',
        'gs-4': '12px',
        'gs-5': '16px',
        'gs-6': '20px',
        'gs-7': '24px',
        'gs-8': '32px',
      },
      borderRadius: {
        'gs-xs': '2px',
        'gs-sm': '6px',
        'gs-md': '40px',
        'gs-lg': '50px',
        'gs-xl': '500px',
        'gs-2xl': '9999px',
      },
      transitionDuration: {
        'motion-instant': '100ms',
        'motion-fast': '150ms',
        'motion-normal': '200ms',
        'motion-slow': '220ms',
        'motion-slower': '300ms',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'bar-equalizer': {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'ambient-slow': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.4' },
          '50%': { transform: 'scale(1.1)', opacity: '0.7' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'slide-up': 'slide-up 300ms ease-out',
        'scale-in': 'scale-in 200ms ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'bar-equalizer': 'bar-equalizer 1s ease-in-out infinite',
        'ambient-slow': 'ambient-slow 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

module.exports = config
