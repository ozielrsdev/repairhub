/// <reference types="vitest/config" />
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    // Variáveis TEST_SUPABASE_* do .env.test.local, para o teste de separação entre
    // assistências (tests/isolamento.test.ts). Só existem nos testes, nunca no app.
    // A VITE_SUPABASE_URL (do app) vem junto só para o teste conferir que não está
    // apontando para o banco das assistências; a chave do app não é carregada.
    env: loadEnv('test', process.cwd(), ['TEST_', 'VITE_SUPABASE_URL']),
  },
})
