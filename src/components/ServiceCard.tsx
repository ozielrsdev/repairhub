import type { DragEvent } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { SERVICE_STATUSES, URGENCY_LEVELS } from '../types'
import type { Service, ServiceStatus, Urgency } from '../types'
import { UrgencyBadge, UrgencyLabel } from './ServiceBadges'

interface ServiceCardProps {
  service: Service
  error: string | null
  expanded: boolean
  dragging: boolean
  diagnosisDraft: string
  serviceDoneDraft: string
  onToggleExpanded: () => void
  onDiagnosisDraftChange: (text: string) => void
  onServiceDoneDraftChange: (text: string) => void
  onSaveDiagnosis: (text: string) => void
  onSaveServiceDone: (text: string) => void
  onStatusChange: (status: ServiceStatus) => void
  onUrgencyChange: (urgency: Urgency) => void
  onDragStart: () => void
  onDragEnd: () => void
}

function StatusSelect({
  status,
  onChange,
  id,
  className,
}: {
  status: ServiceStatus
  onChange: (status: ServiceStatus) => void
  id?: string
  className?: string
}) {
  return (
    <Select value={status} onValueChange={(value) => onChange(value as ServiceStatus)}>
      <SelectTrigger id={id} size="sm" aria-label="Status" className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SERVICE_STATUSES.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Resumido, o card mostra só cliente, urgência, equipamento e problema; os detalhes abrem o
// diagnóstico, o serviço realizado e a troca de urgência. Com os detalhes abertos o card não
// arrasta, pra não atrapalhar a seleção de texto nas caixas.
//
// O seletor de status fica no card resumido só em tela de toque, onde não dá pra arrastar.
// Com mouse, o status muda arrastando, e o seletor fica nos detalhes pra quem usa teclado.
function ServiceCard({
  service,
  error,
  expanded,
  dragging,
  diagnosisDraft,
  serviceDoneDraft,
  onToggleExpanded,
  onDiagnosisDraftChange,
  onServiceDoneDraftChange,
  onSaveDiagnosis,
  onSaveServiceDone,
  onStatusChange,
  onUrgencyChange,
  onDragStart,
  onDragEnd,
}: ServiceCardProps) {
  function handleDragStart(event: DragEvent<HTMLLIElement>) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', service.id)
    onDragStart()
  }

  const diagnosisId = `diagnosis-${service.id}`
  const serviceDoneId = `service-done-${service.id}`
  const urgencyId = `urgency-${service.id}`
  const statusId = `status-${service.id}`

  return (
    <li
      draggable={!expanded}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        'transition-opacity',
        !expanded && 'cursor-grab active:cursor-grabbing',
        dragging && 'opacity-40',
      )}
    >
      <Card size="sm" className="gap-3 shadow-xs">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug break-words">{service.client}</CardTitle>
            <UrgencyBadge urgency={service.urgency} />
          </div>
        </CardHeader>

        <CardContent className="grid gap-3">
          <dl className="grid gap-1 text-sm break-words">
            <div>
              <dt className="inline text-muted-foreground">Equipamento: </dt>
              <dd className="inline">{service.equipment}</dd>
            </div>
            <div>
              <dt className="inline text-muted-foreground">Problema: </dt>
              <dd className="inline">{service.problem}</dd>
            </div>
          </dl>

          {expanded && (
            <div className="grid gap-3 border-t pt-3">
              <div className="grid gap-2">
                <Label htmlFor={diagnosisId}>Diagnóstico</Label>
                <Textarea
                  id={diagnosisId}
                  value={diagnosisDraft}
                  onChange={(event) => onDiagnosisDraftChange(event.target.value)}
                  placeholder="Ex: Fonte queimada, precisa trocar"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="justify-self-start"
                  disabled={diagnosisDraft === service.diagnosis}
                  onClick={() => onSaveDiagnosis(diagnosisDraft)}
                >
                  Salvar diagnóstico
                </Button>
              </div>

              <div className="grid gap-2">
                <Label htmlFor={serviceDoneId}>Serviço realizado</Label>
                <Textarea
                  id={serviceDoneId}
                  value={serviceDoneDraft}
                  onChange={(event) => onServiceDoneDraftChange(event.target.value)}
                  placeholder="Ex: Troca do HD por SSD"
                />
                <Button
                  variant={service.status === 'Em manutenção' ? 'default' : 'secondary'}
                  size="sm"
                  className="justify-self-start"
                  disabled={serviceDoneDraft === service.serviceDone}
                  onClick={() => onSaveServiceDone(serviceDoneDraft)}
                >
                  {service.status === 'Em manutenção' ? 'Salvar e concluir' : 'Salvar serviço realizado'}
                </Button>
              </div>

              <div className="grid gap-2">
                <Label htmlFor={urgencyId}>Urgência</Label>
                <Select
                  value={service.urgency}
                  onValueChange={(value) => onUrgencyChange(value as Urgency)}
                >
                  <SelectTrigger id={urgencyId} size="sm" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        <UrgencyLabel urgency={level} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2 pointer-coarse:hidden">
                <Label htmlFor={statusId}>Status</Label>
                <StatusSelect
                  id={statusId}
                  status={service.status}
                  onChange={onStatusChange}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <StatusSelect
              status={service.status}
              onChange={onStatusChange}
              className="hidden min-w-36 pointer-coarse:flex"
            />

            <Button
              variant="ghost"
              size="sm"
              aria-expanded={expanded}
              onClick={onToggleExpanded}
              className="text-primary hover:text-primary"
            >
              {expanded ? 'Fechar detalhes' : 'Ver detalhes'}
              <ChevronDownIcon
                data-icon="inline-end"
                className={cn('transition-transform', expanded && 'rotate-180')}
              />
            </Button>
          </div>

          {error && (
            <p
              className="form-error rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </li>
  )
}

export default ServiceCard
