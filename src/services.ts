import { z } from 'zod'
import { SERVICE_STATUSES, URGENCY_LEVELS } from './types'
import type { Service, ServiceStatus, Urgency } from './types'

const URGENCY_ERROR = 'Escolha a urgência: Baixa, Média, Alta ou Crítica'

// O diagnóstico e o serviço realizado não são obrigatórios no cadastro: o diagnóstico é
// exigido ao ir para Em manutenção, e o serviço realizado, ao concluir.
const newServiceSchema = z.object({
  client: z.string().trim().min(1, { message: 'Cliente é obrigatório' }),
  equipment: z.string().trim().min(1, { message: 'Equipamento é obrigatório' }),
  problem: z.string().trim().min(1, { message: 'Descrição do problema é obrigatória' }),
  diagnosis: z.string().trim().default(''),
  serviceDone: z.string().trim().default(''),
  urgency: z.enum(URGENCY_LEVELS, { message: URGENCY_ERROR }).default('Média'),
})

export type NewServiceInput = z.input<typeof newServiceSchema>

export function createService(input: NewServiceInput): Service {
  const result = newServiceSchema.safeParse(input)

  if (!result.success) {
    throw new Error(result.error.issues[0].message)
  }

  return { id: crypto.randomUUID(), ...result.data, status: 'Recebido' }
}

// O status anda um passo por vez na ordem de SERVICE_STATUSES, pra frente ou pra trás.
export function changeStatus(service: Service, newStatus: ServiceStatus): Service {
  if (newStatus === service.status) {
    return service
  }

  const currentIndex = SERVICE_STATUSES.indexOf(service.status)
  const newIndex = SERVICE_STATUSES.indexOf(newStatus)

  if (Math.abs(newIndex - currentIndex) !== 1) {
    throw new Error(
      `Não é possível mudar de "${service.status}" para "${newStatus}": o status anda um passo por vez`,
    )
  }

  if (newStatus === 'Em manutenção' && !service.diagnosis.trim()) {
    throw new Error('Preencha o diagnóstico antes de colocar o serviço Em manutenção')
  }

  if (newStatus === 'Concluído' && !service.serviceDone.trim()) {
    throw new Error('Preencha o serviço realizado antes de marcar como Concluído')
  }

  return { ...service, status: newStatus }
}

// Salvar o serviço realizado de um serviço Em manutenção já o conclui: é o único status
// a um passo de Concluído. Nos outros, só registra o texto.
export function updateServiceDone(service: Service, serviceDone: string): Service {
  const text = serviceDone.trim()

  if (service.status === 'Concluído' && !text) {
    throw new Error('Serviço concluído precisa ter o serviço realizado preenchido')
  }

  const updated = { ...service, serviceDone: text }

  if (updated.status === 'Em manutenção' && text) {
    return changeStatus(updated, 'Concluído')
  }

  return updated
}

// O diagnóstico pode ser registrado em qualquer status e não muda o status. Só não pode
// ser apagado depois que o serviço entrou em manutenção, senão a regra seria contornada.
export function updateDiagnosis(service: Service, diagnosis: string): Service {
  const text = diagnosis.trim()

  if ((service.status === 'Em manutenção' || service.status === 'Concluído') && !text) {
    throw new Error('Serviço Em manutenção ou Concluído precisa ter o diagnóstico preenchido')
  }

  return { ...service, diagnosis: text }
}

// A urgência pode mudar em qualquer status (o diagnóstico pode mostrar que é mais grave do
// que parecia) e não mexe no status.
export function updateUrgency(service: Service, urgency: Urgency): Service {
  if (!URGENCY_LEVELS.includes(urgency)) {
    throw new Error(URGENCY_ERROR)
  }

  return { ...service, urgency }
}

// Mais urgentes primeiro. O sort é estável, então com a mesma urgência fica a ordem de
// chegada da lista recebida.
export function sortByUrgency(services: Service[]): Service[] {
  return [...services].sort(
    (a, b) => URGENCY_LEVELS.indexOf(b.urgency) - URGENCY_LEVELS.indexOf(a.urgency),
  )
}

// Status para os quais o serviço pode ir agora, segundo as regras do changeStatus. A tela
// usa pra destacar as colunas onde dá pra soltar o card.
export function allowedStatuses(service: Service): ServiceStatus[] {
  return SERVICE_STATUSES.filter((status) => {
    if (status === service.status) {
      return false
    }

    try {
      changeStatus(service, status)
      return true
    } catch {
      return false
    }
  })
}
