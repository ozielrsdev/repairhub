import type { AuthError, SupabaseClient } from '@supabase/supabase-js'
import type { AgencySignUp } from './services'

// Mensagens do Supabase Auth (em inglês, técnicas) traduzidas pra quem usa o sistema.
function authMessage(error: AuthError): string {
  switch (error.code) {
    case 'invalid_credentials':
      return 'E-mail ou senha incorretos'
    case 'email_not_confirmed':
      return 'Confirme o seu e-mail antes de entrar: abra o link da mensagem que enviamos'
    case 'weak_password':
      return 'Senha fraca: use uma senha mais longa, com letras e números'
    case 'user_already_exists':
    case 'email_exists':
      return 'Já existe uma conta com esse e-mail'
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo'
    default:
      // O gatilho do banco recusa CNPJ repetido; o Supabase devolve um erro genérico.
      if (error.message.includes('Database error')) {
        return 'Não foi possível criar a conta. Confira se esse CNPJ já não tem conta'
      }
      return 'Não foi possível concluir. Confira sua conexão e tente de novo'
  }
}

export async function signIn(client: SupabaseClient, email: string, password: string) {
  const { error } = await client.auth.signInWithPassword({ email: email.trim(), password })
  if (error) {
    throw new Error(authMessage(error))
  }
}

// Devolve true se já entrou (confirmação de e-mail desligada) ou false se precisa
// confirmar o e-mail antes.
export async function signUp(
  client: SupabaseClient,
  email: string,
  password: string,
  agency: AgencySignUp,
): Promise<boolean> {
  const { data, error } = await client.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: window.location.origin,
      // Lidos pelo gatilho criar_assistencia_do_dono (supabase/migrations).
      data: {
        nome_fantasia: agency.tradeName,
        razao_social: agency.legalName,
        cnpj: agency.cnpj,
        telefone: agency.phone,
      },
    },
  })

  if (error) {
    throw new Error(authMessage(error))
  }

  return data.session !== null
}

export async function signOut(client: SupabaseClient) {
  await client.auth.signOut()
}
