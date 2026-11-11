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
    env: loadEnv('test', process.cwd(), 'TEST_'),
  },
})
