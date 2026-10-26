export type ServiceStatus = 'Recebido' | 'Em análise' | 'Em manutenção' | 'Concluído'

export interface Service {
  id: string
  client: string
  equipment: string
  problem: string
  diagnosis: string
  serviceDone: string
  status: ServiceStatus
}

export const SERVICE_STATUSES: ServiceStatus[] = [
  'Recebido',
  'Em análise',
  'Em manutenção',
  'Concluído',
]

export const STATUS_SLUGS: Record<ServiceStatus, string> = {
  Recebido: 'recebido',
  'Em análise': 'em-analise',
  'Em manutenção': 'em-manutencao',
  Concluído: 'concluido',
}
