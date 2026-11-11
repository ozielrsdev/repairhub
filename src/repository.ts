import type { SupabaseClient } from '@supabase/supabase-js'
import type { Service, ServiceStatus, Urgency } from './types'

// O erro técnico do banco não vai pra tela: pode ter detalhe interno e está em inglês.
const SAVE_ERROR = 'Não foi possível salvar. Confira sua conexão e tente de novo.'
const LOAD_ERROR = 'Não foi possível carregar os dados. Confira sua conexão e recarregue a página.'

const SERVICE_COLUMNS =
  'id, cliente, equipamento, problema, diagnostico, servico_realizado, orcamento, urgencia, status'

// Linha da tabela ordens_servico (supabase/migrations/0001_assistencias_e_os.sql).
export interface ServiceRow {
  id: string
  cliente: string
  equipamento: string
  problema: string
  diagnostico: string
  servico_realizado: string
  orcamento: number | null
  urgencia: Urgency
  status: ServiceStatus
}

export function rowToService(row: ServiceRow): Service {
  return {
    id: row.id,
    client: row.cliente,
    equipment: row.equipamento,
    problem: row.problema,
    diagnosis: row.diagnostico,
    serviceDone: row.servico_realizado,
    budget: row.orcamento,
    urgency: row.urgencia,
    status: row.status,
  }
}

export function serviceToRow(service: Service): ServiceRow {
  return {
    id: service.id,
    cliente: service.client,
    equipamento: service.equipment,
    problema: service.problem,
    diagnostico: service.diagnosis,
    servico_realizado: service.serviceDone,
    orcamento: service.budget,
    urgencia: service.urgency,
    status: service.status,
  }
}

// Assistência do dono logado (o Row Level Security só devolve a dele).
export interface Agency {
  tradeName: string
  legalName: string
  cnpj: string
}

export async function loadAgency(client: SupabaseClient): Promise<Agency> {
  const { data, error } = await client
    .from('assistencias')
    .select('nome_fantasia, razao_social, cnpj')
    .single()

  if (error) {
    throw new Error(LOAD_ERROR)
  }

  return { tradeName: data.nome_fantasia, legalName: data.razao_social, cnpj: data.cnpj }
}

// OS da assistência do dono logado, na ordem de chegada (o sortByUrgency depende dela).
export async function loadServices(client: SupabaseClient): Promise<Service[]> {
  const { data, error } = await client
    .from('ordens_servico')
    .select(SERVICE_COLUMNS)
    .order('criado_em')

  if (error) {
    throw new Error(LOAD_ERROR)
  }

  return (data as ServiceRow[]).map(rowToService)
}

export async function insertService(client: SupabaseClient, service: Service): Promise<void> {
  const { error } = await client.from('ordens_servico').insert(serviceToRow(service))

  if (error) {
    throw new Error(SAVE_ERROR)
  }
}

// Sem linha alterada quer dizer que a OS não existe ou é de outra assistência.
export async function saveService(client: SupabaseClient, service: Service): Promise<void> {
  const { id, ...fields } = serviceToRow(service)
  const { data, error } = await client
    .from('ordens_servico')
    .update(fields)
    .eq('id', id)
    .select('id')

  if (error) {
    throw new Error(SAVE_ERROR)
  }

  if (data.length === 0) {
    throw new Error('Serviço não encontrado')
  }
}
