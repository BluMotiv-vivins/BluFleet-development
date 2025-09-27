import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Enable source maps for better debugging
    sourcemap: true,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and related libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Redux chunk
          redux: ['@reduxjs/toolkit', 'react-redux'],
          // UI libraries chunk
          ui: ['react-hot-toast', 'react-window'],
          // Map chunk (heavy dependency)
          map: ['mapbox-gl'],
          // Charts chunk
          charts: ['recharts'],
        },
      },
    },
    // Increase chunk size warning limit for better performance
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'react-hot-toast',
      'react-window',
    ],
    exclude: [
      // Exclude heavy dependencies from pre-bundling
      'mapbox-gl',
    ],
  },
  // Performance optimizations
  server: {
    // Enable HTTP/2 for better performance
    https: false,
    // Optimize HMR
    hmr: {
      overlay: true,
    },
    // Proxy API requests to backend
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
