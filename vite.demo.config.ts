/**
 * Build de DEMONSTRAÇÃO para enviar ao cliente (npm run build:demo).
 *
 * - Gera um único `index.html` com todo o JS e CSS embutidos, que abre com duplo clique (file://).
 * - Usa rotas com "#" (HashRouter), que funcionam sem servidor e em qualquer hospedagem estática.
 * - NÃO inclui a API administrativa: o login de administrador fica indisponível nesta versão.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
  define: {
    'import.meta.env.VITE_DEMO_BUILD': JSON.stringify('true'),
  },
  build: {
    outDir: 'demo-build',
    emptyOutDir: true,
  },
});
