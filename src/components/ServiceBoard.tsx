import { useState } from 'react'
import type { DragEvent } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { allowedStatuses, sortByUrgency } from '../services'
import { SERVICE_STATUSES } from '../types'
import type { Service, ServiceStatus, Urgency } from '../types'
import { StatusBadge } from './ServiceBadges'
import ServiceCard from './ServiceCard'

interface ServiceBoardProps {
  services: Service[]
  onStatusChange: (id: string, status: ServiceStatus) => string | null
  onDiagnosisChange: (id: string, diagnosis: string) => string | null
  onServiceDoneChange: (id: string, serviceDone: string) => string | null
  onUrgencyChange: (id: string, urgency: Urgency) => string | null
}

function withoutKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  const next = { ...record }
  delete next[key]
  return next
}

// O estado dos cards fica aqui, e não em cada card, porque o card é recriado quando muda
// de coluna: assim o texto não salvo e os detalhes abertos sobrevivem à mudança de status.
function ServiceBoard({
  services,
  onStatusChange,
  onDiagnosisChange,
  onServiceDoneChange,
  onUrgencyChange,
}: ServiceBoardProps) {
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  // Texto que o técnico está digitando e ainda não salvou, por serviço.
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [diagnosisDrafts, setDiagnosisDrafts] = useState<Record<string, string>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const draggingService = services.find((service) => service.id === draggingId)
  const dropTargets = draggingService ? allowedStatuses(draggingService) : []

  function handleStatusChange(id: string, status: ServiceStatus) {
    const result = onStatusChange(id, status)
    setErrors((current) => ({ ...current, [id]: result }))

    // Abre os detalhes pra pessoa ver o campo que falta preencher.
    if (result) {
      setExpanded((current) => ({ ...current, [id]: true }))
    }
  }

  function handleSaveDiagnosis(id: string, diagnosis: string) {
    const result = onDiagnosisChange(id, diagnosis)
    setErrors((current) => ({ ...current, [id]: result }))

    if (!result) {
      setDiagnosisDrafts((current) => withoutKey(current, id))
    }
  }

  function handleSaveServiceDone(id: string, serviceDone: string) {
    const result = onServiceDoneChange(id, serviceDone)
    setErrors((current) => ({ ...current, [id]: result }))

    if (!result) {
      setDrafts((current) => withoutKey(current, id))
    }
  }

  function handleUrgencyChange(id: string, urgency: Urgency) {
    const result = onUrgencyChange(id, urgency)
    setErrors((current) => ({ ...current, [id]: result }))
  }

  function handleDragOver(event: DragEvent<HTMLElement>, status: ServiceStatus) {
    // Aceita soltar em qualquer outra coluna: se a regra não deixar, o card fica onde
    // estava e a mensagem de erro aparece nele.
    if (draggingService && draggingService.status !== status) {
      event.preventDefault()
    }
  }

  function handleDrop(event: DragEvent<HTMLElement>, status: ServiceStatus) {
    event.preventDefault()
    if (draggingId) {
      handleStatusChange(draggingId, status)
    }
    setDraggingId(null)
  }

  // Durante o arraste: borda tracejada onde dá pra soltar, apagada onde não dá.
  function dropState(status: ServiceStatus): 'allowed' | 'blocked' | null {
    if (!draggingService || draggingService.status === status) {
      return null
    }
    return dropTargets.includes(status) ? 'allowed' : 'blocked'
  }

  return (
    <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {SERVICE_STATUSES.map((status) => {
        const columnServices = sortByUrgency(services.filter((service) => service.status === status))
        const drop = dropState(status)

        return (
          <section
            key={status}
            aria-label={status}
            data-drop={drop ?? undefined}
            className={cn(
              'grid content-start gap-3 rounded-xl border-2 border-transparent bg-muted/60 p-3 transition-all sm:min-h-40',
              drop === 'allowed' && 'border-dashed border-primary bg-primary/5',
              drop === 'blocked' && 'opacity-40',
            )}
            onDragOver={(event) => handleDragOver(event, status)}
            onDrop={(event) => handleDrop(event, status)}
          >
            <header className="flex items-center justify-between">
              <StatusBadge status={status} />
              <Badge variant="secondary" className="tabular-nums" aria-label="Quantidade de serviços">
                {columnServices.length}
              </Badge>
            </header>

            {columnServices.length === 0 ? (
              <p className="rounded-lg border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
                Nenhum serviço
              </p>
            ) : (
              <ul className="grid gap-3">
                {columnServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    error={errors[service.id] ?? null}
                    expanded={expanded[service.id] ?? false}
                    dragging={service.id === draggingId}
                    diagnosisDraft={diagnosisDrafts[service.id] ?? service.diagnosis}
                    serviceDoneDraft={drafts[service.id] ?? service.serviceDone}
                    onToggleExpanded={() =>
                      setExpanded((current) => ({ ...current, [service.id]: !current[service.id] }))
                    }
                    onDiagnosisDraftChange={(text) =>
                      setDiagnosisDrafts((current) => ({ ...current, [service.id]: text }))
                    }
                    onServiceDoneDraftChange={(text) =>
                      setDrafts((current) => ({ ...current, [service.id]: text }))
                    }
                    onSaveDiagnosis={(text) => handleSaveDiagnosis(service.id, text)}
                    onSaveServiceDone={(text) => handleSaveServiceDone(service.id, text)}
                    onStatusChange={(newStatus) => handleStatusChange(service.id, newStatus)}
                    onUrgencyChange={(urgency) => handleUrgencyChange(service.id, urgency)}
                    onDragStart={() => setDraggingId(service.id)}
                    onDragEnd={() => setDraggingId(null)}
                  />
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}

export default ServiceBoard
