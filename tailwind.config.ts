import type { Config } from 'tailwindcss';

/**
 * הגדרות Tailwind CSS עם ערכת נושא מלאה:
 * - צבעי shadcn/ui (CSS variables) — לתאימות עם קומפוננטות קיימות
 * - צבעי MD3 (Material Design 3) — לקוד חדש עם עיצוב קוסמי
 * - שלוש משפחות פונטים: headline, body, label
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      fontFamily: {
        headline: ['var(--font-headline)', 'Plus Jakarta Sans', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        label: ['var(--font-label)', 'Manrope', 'sans-serif'],
      },
      colors: {
        // ===== shadcn/ui CSS-variable colors — נשמרים לתאימות עם קומפוננטות קיימות =====
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },

        // ===== MD3 — Material Design 3 flat color tokens (עיצוב קוסמי) =====

        // Primary (סגול ראשי)
        'primary-container': '#8f2de6',
        'primary-fixed': '#f0dbff',
        'primary-fixed-dim': '#ddb8ff',
        'on-primary': '#490080',
        'on-primary-container': '#f2dfff',
        'on-primary-fixed': '#2c0051',
        'on-primary-fixed-variant': '#6800b4',
        'inverse-primary': '#861fdd',

        // Secondary (כחול-סגול משני)
        'secondary-container': '#3626ce',
        'secondary-fixed': '#e2dfff',
        'secondary-fixed-dim': '#c3c0ff',
        'on-secondary': '#1d00a5',
        'on-secondary-container': '#b3b1ff',
        'on-secondary-fixed': '#0f0069',
        'on-secondary-fixed-variant': '#3323cc',

        // Tertiary (ירוק-טורקיז)
        tertiary: '#4edea3',
        'tertiary-container': '#007650',
        'tertiary-fixed': '#6ffbbe',
        'tertiary-fixed-dim': '#4edea3',
        'on-tertiary': '#003824',
        'on-tertiary-container': '#76ffc2',
        'on-tertiary-fixed': '#002113',
        'on-tertiary-fixed-variant': '#005236',

        // Surface & Background (רקעים כהים)
        surface: '#131315',
        'surface-dim': '#131315',
        'surface-bright': '#39393b',
        'surface-container-lowest': '#0e0e10',
        'surface-container-low': '#1c1b1d',
        'surface-container': '#201f22',
        'surface-container-high': '#2a2a2c',
        'surface-container-highest': '#353437',
        'surface-tint': '#ddb8ff',
        'surface-variant': '#353437',
        'on-surface': '#e5e1e4',
        'on-surface-variant': '#ccc3d8',
        'on-background': '#e5e1e4',

        // Error (שגיאות)
        'error-container': '#93000a',
        'on-error': '#690005',
        'on-error-container': '#ffdad6',

        // Outline (גבולות)
        outline: '#958da1',
        'outline-variant': '#4a4455',

        // Inverse (היפוך)
        'inverse-surface': '#e5e1e4',
        'inverse-on-surface': '#313032',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
