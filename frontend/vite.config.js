import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom']
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "leaflet", "leaflet-draw"]
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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React core libraries - be very specific to avoid matching react-* packages
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router-dom/')) {
              return 'react-vendor';
            }
            
            // PDF generation libraries
            if (id.includes('jspdf')) {
              return 'pdf-libs';
            }
            
            // Map libraries - Keep leaflet and leaflet-draw together
            if (id.includes('leaflet')) {
              return 'map-libs';
            }
            
            // Chart libraries
            if (id.includes('chart.js') || id.includes('recharts')) {
              return 'chart-libs';
            }
            
            // React-related chart library (separate to avoid React conflicts)
            if (id.includes('react-chartjs-2')) {
              return 'chart-libs';
            }
            
            // React Query and state management
            if (id.includes('@tanstack/react-query') || id.includes('zustand')) {
              return 'data-libs';
            }
            
            // Socket.IO for real-time
            if (id.includes('socket.io-client')) {
              return 'socket-libs';
            }
            
            // UI libraries
            if (id.includes('lucide-react') || id.includes('react-hot-toast') || id.includes('@headlessui') || id.includes('react-icons')) {
              return 'ui-libs';
            }
            
            // All other node_modules
            return 'vendor';
          }
        }
      }
    },
    
    // Increased limit but with proper chunking above
    chunkSizeWarningLimit: 1000
  }
})
