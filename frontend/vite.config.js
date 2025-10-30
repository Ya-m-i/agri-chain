import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"]
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Removed proxy configuration for production - using hosted backend
  },
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13'],
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        
        // Manual chunks for better code splitting
        manualChunks: {
          // React core libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // PDF generation libraries
          'pdf-libs': ['jspdf', 'jspdf-autotable'],
          
          // Map libraries
          'map-libs': ['leaflet', 'leaflet-draw'],
          
          // Chart libraries
          'chart-libs': ['chart.js', 'react-chartjs-2', 'recharts'],
          
          // React Query and state management
          'data-libs': ['@tanstack/react-query', 'zustand'],
          
          // Socket.IO for real-time
          'socket-libs': ['socket.io-client'],
          
          // UI libraries
          'ui-libs': ['lucide-react', 'react-hot-toast', '@headlessui/react'],
          
          // Utilities
          'utils': ['axios']
        }
      }
    },
    
    // Increased limit but with proper chunking above
    chunkSizeWarningLimit: 1000
  }
})
