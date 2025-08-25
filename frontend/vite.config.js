import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ["jspdf", "canvg", "react", "react-dom", "react-router-dom"],
    exclude: ["lucide-react"] // Large icon library - load dynamically
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Enhanced build optimizations
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13'],
    cssCodeSplit: true,
    sourcemap: false, // Disable in production for smaller files
    minify: 'esbuild', // Faster than terser
    
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI libraries
          'ui-vendor': ['@headlessui/react', 'lucide-react', 'react-hot-toast'],
          
          // Chart libraries
          'chart-vendor': ['chart.js', 'react-chartjs-2', 'recharts'],
          
          // Map libraries
          'map-vendor': ['leaflet'],
          
          // PDF libraries
          'pdf-vendor': ['jspdf', 'jspdf-autotable', 'canvg'],
          
          // State management
          'state-vendor': ['zustand'],
          
          // Utilities
          'utils-vendor': ['ml5'],
        },
        
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            return 'assets/[name]-[hash].js'
          }
          return 'assets/chunk-[hash].js'
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(jpe?g|png|gif|svg|webp)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${ext}`
          }
          return `assets/[name]-[hash].${ext}`
        }
      }
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 500, // KB
    
    commonjsOptions: {
      include: [/jspdf/, /canvg/, /node_modules/],
    },
    
    // Asset handling
    assetsInlineLimit: 4096, // 4KB - inline smaller assets
  },
  
  // CSS optimization
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      // Add any CSS preprocessor options here if needed
    }
  },
  
  // Preview server configuration
  preview: {
    host: '0.0.0.0',
    port: 4173,
    cors: true
  },
  
  // Development optimizations
  esbuild: {
    // Remove console logs and debugger in production
    drop: ['console', 'debugger'], // Will be handled by build process
  },
})
