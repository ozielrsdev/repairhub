import { SERVICE_STATUSES, STATUS_SLUGS } from '../types'
import type { Service, ServiceStatus } from '../types'

interface ServiceListProps {
  services: Service[]
  onStatusChange: (id: string, status: ServiceStatus) => void
}

function ServiceList({ services, onStatusChange }: ServiceListProps) {
  if (services.length === 0) {
    return <p className="empty-state">Nenhum serviço cadastrado ainda.</p>
  }

  return (
    <ul className="service-list">
      {services.map((service) => (
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
          {service.serviceDone && (
            <p>
              <strong>Serviço realizado:</strong> {service.serviceDone}
            </p>
          )}

          <label className="status-select">
            Atualizar status
            <select
              value={service.status}
              onChange={(event) => onStatusChange(service.id, event.target.value as ServiceStatus)}
            >
              {SERVICE_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </li>
      ))}
    </ul>
  )
}

export default ServiceList
