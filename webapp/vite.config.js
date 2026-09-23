import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The course Markdown files live one level above this app (../README.md, ../0*.md, ../exercises/*.md).
// We allow serving them during dev and bundle them as raw strings at build time.
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: ['..', '../..'],
    },
  },
})
