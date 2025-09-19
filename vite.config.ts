import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 3000,
    host: true, // Для доступа по локальной сети
  },
  build: {
    sourcemap: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React ecosystem
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom')) {
            return 'react-vendor'
          }

          // Canvas rendering library
          if (id.includes('node_modules/konva') ||
              id.includes('node_modules/react-konva')) {
            return 'konva-vendor'
          }

          // UI component libraries
          if (id.includes('node_modules/@radix-ui') ||
              id.includes('node_modules/@stitches')) {
            return 'ui-vendor'
          }

          // State management
          if (id.includes('node_modules/zustand') ||
              id.includes('node_modules/immer')) {
            return 'state-vendor'
          }

          // Icon library
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor'
          }

          // Utilities
          if (id.includes('node_modules/uuid') ||
              id.includes('node_modules/nanoid') ||
              id.includes('node_modules/file-saver')) {
            return 'utils-vendor'
          }
        },
      },
    },
    // Optimize for production
    minify: 'terser',
  },
})