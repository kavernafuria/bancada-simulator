import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allows PORT env var (e.g. PORT=8080 or PORT=5173), default to 3000 for AI Studio or 8080/high port if specified
const port = Number(process.env.PORT) || 3000;

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port,
      host: '0.0.0.0',
      strictPort: false, // If the port is already in use, Vite will automatically try the next free high port (e.g. 3001, 8081, etc.)
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      port: Number(process.env.PORT) || 8080,
      host: '0.0.0.0',
      strictPort: false,
    },
  };
});
