import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Configure base URL for GitHub Pages
  base: mode === 'production' ? '/DnD_batlefield/' : '/',
  plugins: [
    react(),
    vanillaExtractPlugin()
  ],
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
        // Improved file naming for better caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') ?? []
          const extType = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/images/[name]-[hash][extname]`
          }
          if (/woff2?|eot|ttf|otf/i.test(extType)) {
            return `assets/fonts/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
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
              id.includes('node_modules/@vanilla-extract')) {
            return 'ui-vendor'
          }

          // State management
          if (id.includes('node_modules/zustand') ||
              id.includes('node_modules/immer')) {
            return 'state-vendor'
          }

          // Icon library (optimized)
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor'
          }

          // Utilities
          if (id.includes('node_modules/uuid') ||
              id.includes('node_modules/nanoid') ||
              id.includes('node_modules/file-saver')) {
            return 'utils-vendor'
          }

          // Feature-based chunking for app code
          if (id.includes('/src/components/Timeline/')) {
            return 'timeline-feature'
          }
          if (id.includes('/src/components/Collaboration/')) {
            return 'collaboration-feature'
          }
          if (id.includes('/src/components/Tools/')) {
            return 'tools-feature'
          }
          if (id.includes('/src/components/Export/') ||
              id.includes('/src/components/Import/')) {
            return 'file-operations-feature'
          }
        },
      },
    },
    // Enhanced production optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'], // Remove specific console methods
      },
      mangle: {
        safari10: true, // Fix Safari 10 issues
      },
    },
    // Enable modern browser optimizations
    target: 'es2020',
  },
}))