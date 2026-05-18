import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
        env.VITE_SUPABASE_URL || 'https://syysjxhlcnblhcnesqcf.supabase.co'
      ),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
        env.VITE_SUPABASE_ANON_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5eXNqeGhsY25ibGhjbmVzcWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNjQ4ODYsImV4cCI6MjA5NDY0MDg4Nn0.0aanP9tVR6Z8CtLveQUcz8ThxFk-Aoe6klBUqbUjmKs'
      ),
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      chunkSizeWarningLimit: 1800,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          admin: resolve(__dirname, 'admin.html'),
        },
        output: {
          manualChunks: {
            phaser: ['phaser'],
          },
        },
      },
    },
    server: {
      proxy: {
        '/api/bus': {
          target: 'http://ws.bus.go.kr',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/bus/, '/api/rest'),
        },
      },
    },
  };
});
