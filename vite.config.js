import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  css: {
    postcss: {},
  },
  build: {
    rollupOptions: {
      output: {
        // This splits your code into smaller, manageable pieces
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Put all 3rd party libraries into a 'vendor' chunk
            return 'vendor';
          }
        },
      },
    },
    // Increases the limit before Vite warns you about large files
    chunkSizeWarningLimit: 1000, 
  },
})