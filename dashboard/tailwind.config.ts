import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#F5F3EF',
          subtle: '#EEECE6',
          card: '#FFFFFF',
          cardMuted: '#F0EEE9',
        },
        editorial: {
          black: '#171717',
          900: '#171717',
          800: '#2A2926',
          700: '#403E39',
          600: '#5C5A54',
          500: '#73716B',
          400: '#85837E',
          300: '#A5A29C',
          200: '#D9D6CF',
          100: '#EAE7E0',
          50: '#F5F3EF',
        },
        accent: {
          DEFAULT: '#F45B2A',
          hover: '#DF4A1B',
          active: '#C73E14',
          subtle: '#FFF3EE',
          muted: '#FFECE4',
          border: '#FDC4B0',
        },
        status: {
          success: '#236B43',
          successBg: '#EDF7F0',
          successBorder: '#C6E7D2',
          warning: '#92400E',
          warningBg: '#FEF3C7',
          warningBorder: '#FDE68A',
          critical: '#B91C1C',
          criticalBg: '#FEF2F2',
          criticalBorder: '#FECACA',
          info: '#1E40AF',
          infoBg: '#EFF6FF',
          infoBorder: '#DBEAFE',
        },
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'bento': '0 1px 3px rgba(23, 23, 23, 0.03), 0 4px 12px -2px rgba(23, 23, 23, 0.03)',
        'bento-hover': '0 8px 24px -4px rgba(23, 23, 23, 0.06), 0 2px 6px -1px rgba(23, 23, 23, 0.03)',
        'subtle': '0 1px 2px 0 rgba(23, 23, 23, 0.03)',
        'accent-glow': '0 4px 20px -2px rgba(244, 91, 42, 0.25)',
      },
      borderRadius: {
        'bento': '1rem',
        'bento-lg': '1.25rem',
      },
      animation: {
        'pulse-subtle': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
