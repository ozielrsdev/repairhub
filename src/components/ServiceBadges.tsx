import { ChevronsDownIcon, ChevronsUpIcon, ChevronUpIcon, EqualIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { ServiceStatus, Urgency } from '../types'

const STATUS_COLORS: Record<ServiceStatus, string> = {
  Recebido: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  'Em análise': 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  'Em manutenção': 'bg-primary/15 text-primary',
  Concluído: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
}

// Ícones no estilo de prioridade de quadro de tarefas: quanto mais setas pra cima, mais urgente.
const URGENCY_STYLES: Record<Urgency, { icon: LucideIcon; color: string }> = {
  Baixa: { icon: ChevronsDownIcon, color: 'text-sky-600 dark:text-sky-400' },
  Média: { icon: EqualIcon, color: 'text-muted-foreground' },
  Alta: { icon: ChevronUpIcon, color: 'text-orange-600 dark:text-orange-400' },
  Crítica: { icon: ChevronsUpIcon, color: 'text-red-600 dark:text-red-400' },
}

export function StatusBadge({ status }: { status: ServiceStatus }) {
  return <Badge className={STATUS_COLORS[status]}>{status}</Badge>
}

// Ícone + nome do nível; serve no selo do card e dentro dos seletores de urgência.
export function UrgencyLabel({ urgency }: { urgency: Urgency }) {
  const { icon: Icon, color } = URGENCY_STYLES[urgency]
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className={cn('size-4', color)} strokeWidth={2.5} aria-hidden />
      {urgency}
    </span>
  )
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'h-6 gap-1 px-2',
        urgency === 'Crítica' && 'border-red-500/40 bg-red-500/10 font-semibold',
      )}
      title={`Urgência ${urgency}`}
    >
      <UrgencyLabel urgency={urgency} />
    </Badge>
  )
}
