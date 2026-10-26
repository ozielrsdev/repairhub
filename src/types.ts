export type ServiceStatus = 'Recebido' | 'Em análise' | 'Em manutenção' | 'Concluído'

export type Urgency = 'Baixa' | 'Média' | 'Alta' | 'Crítica'

export interface Service {
  id: string
  client: string
  equipment: string
  problem: string
  diagnosis: string
  serviceDone: string
  urgency: Urgency
  status: ServiceStatus
}

export const SERVICE_STATUSES: ServiceStatus[] = [
  'Recebido',
  'Em análise',
  'Em manutenção',
  'Concluído',
]

// Do menos para o mais urgente.
export const URGENCY_LEVELS: Urgency[] = ['Baixa', 'Média', 'Alta', 'Crítica']
