import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['matcha-icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Map My Matcha',
        short_name: 'MapMyMatcha',
        description: 'Discover, rate, and review the best matcha cafes near you',
        theme_color: '#4A7C3F',
        background_color: '#DCECD5',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Cache the app shell; never cache Firestore/Maps API traffic
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        navigateFallback: '/index.html',
        runtimeCaching: []
      }
    })
  ],
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/.claude/**']
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/places-proxy': {
        target: 'https://maps.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/places-proxy/, '')
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'vendor-maps': ['@react-google-maps/api']
        }
      }
    }
  }
})
