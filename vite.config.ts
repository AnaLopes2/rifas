import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { adminApiPlugin } from './server/devApi';

// O plugin `adminApiPlugin` só roda no `vite dev` (apply: 'serve').
// Ele NÃO faz parte do build de produção: o site publicado não aceita login administrativo
// até existir um backend real com autenticação segura.
export default defineConfig({
  plugins: [react(), tailwindcss(), adminApiPlugin()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
});
