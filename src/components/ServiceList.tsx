import { useState } from 'react'
import { SERVICE_STATUSES, STATUS_SLUGS } from '../types'
import type { Service, ServiceStatus } from '../types'

interface ServiceListProps {
  services: Service[]
  onStatusChange: (id: string, status: ServiceStatus) => string | null
  onDiagnosisChange: (id: string, diagnosis: string) => string | null
  onServiceDoneChange: (id: string, serviceDone: string) => string | null
}

function ServiceList({
  services,
  onStatusChange,
  onDiagnosisChange,
  onServiceDoneChange,
}: ServiceListProps) {
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  // Texto que o técnico está digitando e ainda não salvou, por serviço.
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [diagnosisDrafts, setDiagnosisDrafts] = useState<Record<string, string>>({})

  function handleStatusChange(id: string, status: ServiceStatus) {
    const result = onStatusChange(id, status)
    setErrors((current) => ({ ...current, [id]: result }))
  }

  function handleSaveDiagnosis(id: string, diagnosis: string) {
    const result = onDiagnosisChange(id, diagnosis)
    setErrors((current) => ({ ...current, [id]: result }))

    if (!result) {
      setDiagnosisDrafts((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
    }
  }

  function handleSaveServiceDone(id: string, serviceDone: string) {
    const result = onServiceDoneChange(id, serviceDone)
    setErrors((current) => ({ ...current, [id]: result }))

    if (!result) {
      setDrafts((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
    }
  }

  if (services.length === 0) {
    return <p className="empty-state">Nenhum serviço cadastrado ainda.</p>
  }

  return (
    <ul className="service-list">
      {services.map((service) => {
        const draft = drafts[service.id] ?? service.serviceDone
        const diagnosisDraft = diagnosisDrafts[service.id] ?? service.diagnosis

        return (
          <li key={service.id} className="service-card">
            <div className="service-card-header">
              <h3>{service.client}</h3>
              <span className={`status-badge status-${STATUS_SLUGS[service.status]}`}>
                {service.status}
              </span>
            </div>

            <p>
              <strong>Equipamento:</strong> {service.equipment}
            </p>
            {service.problem && (
              <p>
                <strong>Problema:</strong> {service.problem}
              </p>
            )}

            <label className="service-done-edit">
              <strong>Diagnóstico</strong>
              <textarea
                value={diagnosisDraft}
                onChange={(event) =>
                  setDiagnosisDrafts((current) => ({
                    ...current,
                    [service.id]: event.target.value,
                  }))
                }
                placeholder="Ex: Fonte queimada, precisa trocar"
              />
            </label>
            <button
              type="button"
              className="secondary-button"
              disabled={diagnosisDraft === service.diagnosis}
              onClick={() => handleSaveDiagnosis(service.id, diagnosisDraft)}
            >
              Salvar diagnóstico
            </button>

            <label className="service-done-edit">
              <strong>Serviço realizado</strong>
              <textarea
                value={draft}
                onChange={(event) =>
                  setDrafts((current) => ({ ...current, [service.id]: event.target.value }))
                }
                placeholder="Ex: Troca do HD por SSD"
              />
            </label>
            <button
              type="button"
              className="secondary-button"
              disabled={draft === service.serviceDone}
              onClick={() => handleSaveServiceDone(service.id, draft)}
            >
              {service.status === 'Em manutenção' ? 'Salvar e concluir' : 'Salvar serviço realizado'}
            </button>

            <label className="status-select">
              Atualizar status
              <select
                value={service.status}
                onChange={(event) =>
                  handleStatusChange(service.id, event.target.value as ServiceStatus)
                }
              >
                {SERVICE_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            {errors[service.id] && (
              <p className="form-error" role="alert">
                {errors[service.id]}
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default ServiceList
