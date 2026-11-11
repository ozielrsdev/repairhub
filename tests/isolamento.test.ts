import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { insertService, loadAgency, loadServices, saveService, serviceToRow } from '../src/repository'
import { createService } from '../src/services'
import type { Service } from '../src/types'

// ADR 0002: uma assistência nunca lê nem altera os dados de outra. Roda contra um
// projeto do Supabase SÓ DE TESTE (cria e apaga contas), configurado no .env.test.local.
const url = process.env.TEST_SUPABASE_URL
const anonKey = process.env.TEST_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY
// Sem as variáveis, os testes aparecem como "skipped" no resumo do npm test.
const configured = Boolean(url && anonKey && serviceRoleKey)

const noSession = { auth: { persistSession: false, autoRefreshToken: false } }
const password = 'senha-de-teste-123'

// CNPJ válido e diferente a cada execução (o banco não aceita CNPJ repetido).
function randomCnpj(): string {
  const checkDigit = (base: string) => {
    let weight = 2
    let sum = 0
    for (let i = base.length - 1; i >= 0; i--) {
      sum += Number(base[i]) * weight
      weight = weight === 9 ? 2 : weight + 1
    }
    return sum % 11 < 2 ? 0 : 11 - (sum % 11)
  }
  const base = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('') + '0001'
  const first = checkDigit(base)
  return base + first + checkDigit(base + first)
}

describe.skipIf(!configured)('separação entre assistências (banco de teste)', () => {
  let admin: SupabaseClient
  let donoA: SupabaseClient
  let donoB: SupabaseClient
  const userIds: string[] = []
  let assistenciaA = ''
  let osDeA: Service

  async function criarDono(nome: string): Promise<SupabaseClient> {
    const email = `teste-${nome}-${Date.now()}@repairhub.test`
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome_fantasia: `Assistência ${nome}`,
        razao_social: `Assistência ${nome} Ltda`,
        cnpj: randomCnpj(),
        telefone: '',
      },
    })
    if (error) throw error
    userIds.push(data.user.id)

    const client = createClient(url!, anonKey!, noSession)
    const { error: signInError } = await client.auth.signInWithPassword({ email, password })
    if (signInError) throw signInError
    return client
  }

  beforeAll(async () => {
    admin = createClient(url!, serviceRoleKey!, noSession)
    donoA = await criarDono('A')
    donoB = await criarDono('B')

    const { data } = await admin
      .from('assistencias')
      .select('id')
      .eq('dono_id', userIds[0])
      .single()
    assistenciaA = data!.id

    osDeA = createService({
      client: 'Cliente da A',
      equipment: 'Notebook',
      problem: 'Não liga',
    })
    await insertService(donoA, osDeA)
  })

  afterAll(async () => {
    // Apagar a conta apaga a assistência e as OS dela (on delete cascade).
    for (const id of userIds) {
      await admin.auth.admin.deleteUser(id)
    }
  })

  test('o dono vê as OS da própria assistência', async () => {
    expect((await loadServices(donoA)).map((service) => service.id)).toEqual([osDeA.id])
  })

  test('outra assistência não vê as OS', async () => {
    expect(await loadServices(donoB)).toEqual([])
  })

  test('outra assistência não altera as OS', async () => {
    await expect(saveService(donoB, { ...osDeA, client: 'Alterado pela B' })).rejects.toThrow(
      'Serviço não encontrado',
    )
    expect((await loadServices(donoA))[0].client).toBe('Cliente da A')
  })

  test('outra assistência não cria OS em nome da primeira', async () => {
    const intrusa = createService({ client: 'Intruso', equipment: 'PC', problem: 'Teste' })
    const { error } = await donoB
      .from('ordens_servico')
      .insert({ ...serviceToRow(intrusa), assistencia_id: assistenciaA })

    expect(error).not.toBeNull()
    expect((await loadServices(donoA)).map((service) => service.client)).toEqual(['Cliente da A'])
  })

  test('cada dono só lê a própria assistência', async () => {
    expect((await loadAgency(donoB)).tradeName).toBe('Assistência B')
    const { data } = await donoB.from('assistencias').select('id')
    expect(data).toHaveLength(1)
  })

  test('sem login não lê nada', async () => {
    const anonimo = createClient(url!, anonKey!, noSession)
    const { data: assistencias } = await anonimo.from('assistencias').select('id')
    const { data: ordens } = await anonimo.from('ordens_servico').select('id')
    expect(assistencias).toEqual([])
    expect(ordens).toEqual([])
  })
})
