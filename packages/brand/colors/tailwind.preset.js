/**
 * KiteID Tailwind CSS Preset
 * Parchment Identity — Warm Light Theme
 *
 * Usage in apps:
 *   // tailwind.config.js
 *   module.exports = {
 *     presets: [require('@kiteid/brand/tailwind.preset')],
 *     content: ['./src/**\/*.{ts,tsx}'],
 *   }
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Background
        bg: {
          DEFAULT: '#FAF7F0', // Cream Light
          card: '#F5F0E4', // Parchment
          elevated: '#EDE8DC', // Sand Pale
          muted: '#E4DDC9', // Sand Soft
          input: '#F5F0E4',
          white: '#FFFFFF',
        },

        // Border
        border: {
          DEFAULT: '#DBD5C7', // Sand Core
          strong: '#C9C0A6',
          subtle: '#EDE8DC',
          focus: '#C9986A',
        },

        // Text
        text: {
          DEFAULT: '#141414', // Carbon
          secondary: '#2A2A2A',
          tertiary: '#4A4A4A',
          muted: '#6B665C',
          accent: '#9B8564',
          disabled: '#B8B0A0',
          inverse: '#FAF7F0',
        },

        // Brand
        brand: {
          DEFAULT: '#C9986A', // Burnished Gold (signature)
          hover: '#A87C52', // Antique Brass
          glow: '#E8B987', // Gold Glow
          secondary: '#9B8564', // Bronze Core (Kite)
          deep: '#7A6849', // Bronze Deep
          tertiary: '#DBD5C7', // Sand Core
          subtle: '#F5E8D4', // Cream Accent
        },

        // Semantic
        success: {
          DEFAULT: '#5A7A50',
          bg: '#E8EFE2',
        },
        error: {
          DEFAULT: '#A8453C',
          bg: '#F5E2DF',
        },
        warning: {
          DEFAULT: '#B8722E',
          bg: '#F5E8D4',
        },
        info: {
          DEFAULT: '#4A6F8A',
          bg: '#E0E8EF',
        },

        // Raw color tokens (for direct use)
        cream: {
          light: '#FAF7F0',
          DEFAULT: '#F5E8D4',
        },
        parchment: '#F5F0E4',
        sand: {
          pale: '#EDE8DC',
          soft: '#E4DDC9',
          DEFAULT: '#DBD5C7', // Kite heritage
          mid: '#C9C0A6',
        },
        bronze: {
          mute: '#9B8564', // Kite heritage
          DEFAULT: '#9B8564',
          deep: '#7A6849',
        },
        gold: {
          glow: '#E8B987',
          DEFAULT: '#C9986A', // Burnished Gold
          brass: '#A87C52',
        },
        carbon: {
          DEFAULT: '#141414',
        },
        charcoal: '#2A2A2A',
        graphite: '#4A4A4A',
        stone: '#6B665C',
      },

      backgroundImage: {
        'gradient-kite-heritage': 'linear-gradient(135deg, #9B8564 0%, #DBD5C7 100%)',
        'gradient-premium-gold': 'linear-gradient(135deg, #A87C52 0%, #C9986A 50%, #E8B987 100%)',
        'gradient-aged-bronze': 'linear-gradient(180deg, #C9986A 0%, #9B8564 50%, #7A6849 100%)',
        'gradient-parchment': 'linear-gradient(180deg, #FAF7F0 0%, #F5F0E4 100%)',
      },

      boxShadow: {
        'kid-sm': '0 1px 2px rgba(155, 133, 100, 0.08)',
        'kid-md': '0 4px 12px rgba(155, 133, 100, 0.12)',
        'kid-lg': '0 12px 32px rgba(155, 133, 100, 0.16)',
        'kid-xl': '0 24px 64px rgba(155, 133, 100, 0.20)',
        'kid-glow': '0 0 40px rgba(201, 152, 106, 0.30)',
      },

      borderRadius: {
        xs: '4px',
        sm: '6px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        full: '9999px',
      },

      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Roboto Mono', 'ui-monospace', 'monospace'],
      },

      fontSize: {
        display: ['72px', { lineHeight: '1.0', letterSpacing: '-0.04em', fontWeight: '800' }],
        h1: ['48px', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' }],
        h2: ['36px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        h3: ['24px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        h4: ['20px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        body: ['16px', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        sm: ['14px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.4', letterSpacing: '0.02em', fontWeight: '500' }],
        mono: ['14px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '500' }],
      },

      transitionTimingFunction: {
        kid: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      transitionDuration: {
        micro: '150ms',
        default: '250ms',
        macro: '400ms',
      },

      maxWidth: {
        container: '1200px',
        'container-wide': '1400px',
      },
    },
  },
  plugins: [],
};
