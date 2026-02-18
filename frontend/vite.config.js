import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Generate version before build
const generateVersion = () => {
  try {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    const version = `agri-chain-v${timestamp}-${random}`
    
    const versionData = {
      version,
      timestamp,
      buildDate: new Date().toISOString()
    }
    
    // Write to public directory
    const publicPath = resolve(__dirname, 'public', 'version.json')
    writeFileSync(publicPath, JSON.stringify(versionData, null, 2))
    
    console.log(`✅ Generated version: ${version}`)
    console.log(`   Build date: ${versionData.buildDate}`)
  } catch (error) {
    console.warn('Failed to generate version:', error.message)
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(), 
    tailwindcss(),
    {
      name: 'generate-version',
      buildStart() {
        generateVersion()
      }
    }
  ],
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
    sourcemap: true, // Enable sourcemaps for better error tracking
    minify: 'esbuild',
    chunkSizeWarningLimit: 500,
    
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks(id) {
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/leaflet-draw')) return 'leaflet'
          if (id.includes('node_modules/chart.js') || id.includes('node_modules/react-chartjs-2')) return 'chartjs'
          if (id.includes('node_modules/recharts')) return 'recharts'
        }
      },
      onwarn(warning, warn) {
        // Suppress certain warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      }
    }
  }
})
