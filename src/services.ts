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

  return { id: crypto.randomUUID(), ...result.data, budget: null, status: 'Recebido' }
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

  if (newStatus === 'Em manutenção' && service.budget === null) {
    throw new Error('Registre o orçamento antes de colocar o serviço Em manutenção')
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

// O orçamento pode ser registrado ou trocado em qualquer status, mas sempre com valor
// maior que zero.
export function updateBudget(service: Service, budget: number): Service {
  if (!(budget > 0)) {
    throw new Error('O orçamento precisa ser maior que zero')
  }

  return { ...service, budget }
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

// Quantos serviços há em cada status, com zero nos status vazios.
export function countByStatus(services: Service[]): Record<ServiceStatus, number> {
  const counts = Object.fromEntries(SERVICE_STATUSES.map((status) => [status, 0])) as Record<
    ServiceStatus,
    number
  >

  for (const service of services) {
    counts[service.status] += 1
  }

  return counts
}

// Serviços cujo cliente contém o texto buscado, sem diferença entre maiúsculas e minúsculas.
// Busca vazia (ou só espaços) devolve todos.
export function filterByClient(services: Service[], query: string): Service[] {
  const text = query.trim().toLocaleLowerCase('pt-BR')

  if (!text) {
    return services
  }

  return services.filter((service) => service.client.toLocaleLowerCase('pt-BR').includes(text))
}

const CNPJ_ERROR = 'CNPJ inválido: confira os números digitados'

// Dígito verificador do CNPJ (módulo 11). Cada caractere vale o código ASCII menos 48.
function cnpjCheckDigit(base: string): number {
  let weight = 2
  let sum = 0

  for (let i = base.length - 1; i >= 0; i--) {
    sum += (base.charCodeAt(i) - 48) * weight
    weight = weight === 9 ? 2 : weight + 1
  }

  const rest = sum % 11
  return rest < 2 ? 0 : 11 - rest
}

// CNPJ: 12 letras ou números e 2 dígitos verificadores. Dígitos todos iguais
// (00.000.000/0000-00) fecham a conta, mas não são CNPJ de verdade.
function isValidCnpj(cnpj: string): boolean {
  if (!/^[0-9A-Z]{12}[0-9]{2}$/.test(cnpj) || /^(.)\1+$/.test(cnpj)) {
    return false
  }

  const first = cnpjCheckDigit(cnpj.slice(0, 12))
  const second = cnpjCheckDigit(cnpj.slice(0, 12) + first)
  return cnpj.slice(12) === `${first}${second}`
}

const agencySignUpSchema = z.object({
  tradeName: z.string().trim().min(1, { message: 'Nome fantasia é obrigatório' }),
  legalName: z.string().trim().min(1, { message: 'Razão social é obrigatória' }),
  cnpj: z
    .string()
    .transform((value) => value.replace(/[.\-/\s]/g, '').toUpperCase())
    .refine((value) => value.length === 14, {
      message: 'O CNPJ precisa ter 14 caracteres, sem contar a pontuação',
      abort: true,
    })
    .refine(isValidCnpj, { message: CNPJ_ERROR }),
  phone: z.string().trim().default(''),
})

export type AgencySignUpInput = z.input<typeof agencySignUpSchema>
export type AgencySignUp = z.output<typeof agencySignUpSchema>

// Dados de criar a conta da assistência, limpos. O CNPJ fica sem pontuação.
export function validateAgencySignUp(input: AgencySignUpInput): AgencySignUp {
  const result = agencySignUpSchema.safeParse(input)

  if (!result.success) {
    throw new Error(result.error.issues[0].message)
  }

  return result.data
}
