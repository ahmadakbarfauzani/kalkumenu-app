import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        // 1. Halaman Utama (Landing Page)
        main: resolve(__dirname, 'index.html'),
        
        // 2. Halaman Autentikasi
        auth: resolve(__dirname, 'VibeCodeAi-webapp/auth.html'),
        
        // 3. Modul Aplikasi Utama
        app: resolve(__dirname, 'VibeCodeAi-webapp/index.html'),
        kalkulator: resolve(__dirname, 'VibeCodeAi-webapp/kalkulator.html'),
        resep: resolve(__dirname, 'VibeCodeAi-webapp/resep.html')
      }
    }
  }
});
