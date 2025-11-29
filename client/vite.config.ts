import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
  ],
  
  // A SEÇÃO 'CSS' CONFLITANTE FOI REMOVIDA AQUI

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'), 
      '@shared': resolve(__dirname, '../shared'),
    },
  },
  
  server: {
    port: 5173,
    proxy: {
      // Conecta ao Backend (porta 3001)
      '/api': {
        target: 'http://localhost:3001', 
        changeOrigin: true,
        secure: false,
      },
    },
  },
});