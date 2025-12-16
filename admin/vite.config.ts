import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  // Allow deploying under a separate domain (root path) or under a subpath like /admin/
  // Use env VITE_BASE_PATH to override. Example: VITE_BASE_PATH='/' for separate domain
  base: process.env.VITE_BASE_PATH || (process.env.NODE_ENV === 'production' ? '/admin/' : '/'),
})

