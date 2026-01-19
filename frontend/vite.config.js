import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor libraries for better caching
          'vendor': ['react', 'react-dom', 'react-router-dom', 'zustand'],
          'clerk': ['@clerk/clerk-react'],
          // AI libraries are already lazy-loaded, but chunk them together if loaded
          'ai-libs': ['mermaid', 'html2pdf.js'],
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase limit since we're code-splitting
    sourcemap: false, // Disable sourcemaps in production for smaller build
  }
})
