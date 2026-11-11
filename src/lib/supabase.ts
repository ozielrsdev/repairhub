import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// null quando faltam as variáveis de ambiente: a tela mostra como configurar em vez de
// quebrar. Ver .env.example.
export const supabase = url && anonKey ? createClient(url, anonKey) : null
