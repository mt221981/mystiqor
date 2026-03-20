/**
 * הגדרת vitest — מסגרת בדיקות עם תמיכה ב-path aliases ו-JSX
 */
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
  },
  resolve: {
    alias: {
      // NOTE: must NOT have trailing slash — '@/services/...' imports require '@' only
      '@': resolve(__dirname, './src'),
    },
  },
})
