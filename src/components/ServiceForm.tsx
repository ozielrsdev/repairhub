import { useState } from 'react'
import type { FormEvent } from 'react'
import { SERVICE_STATUSES } from '../types'
import type { Service, ServiceStatus } from '../types'

interface ServiceFormProps {
  onAddService: (service: Omit<Service, 'id'>) => void
}

function ServiceForm({ onAddService }: ServiceFormProps) {
  const [client, setClient] = useState('')
  const [equipment, setEquipment] = useState('')
  const [problem, setProblem] = useState('')
  const [serviceDone, setServiceDone] = useState('')
  const [status, setStatus] = useState<ServiceStatus>('Recebido')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!client.trim() || !equipment.trim()) {
      return
    }

    onAddService({ client, equipment, problem, serviceDone, status })

    setClient('')
    setEquipment('')
    setProblem('')
    setServiceDone('')
    setStatus('Recebido')
  }

  return (
    <form className="service-form" onSubmit={handleSubmit}>
      <h2>Novo serviço</h2>

      <label htmlFor="client">Cliente</label>
      <input
        id="client"
        type="text"
        value={client}
        onChange={(event) => setClient(event.target.value)}
        placeholder="Nome do cliente"
        required
      />

      <label htmlFor="equipment">Equipamento</label>
      <input
        id="equipment"
        type="text"
        value={equipment}
        onChange={(event) => setEquipment(event.target.value)}
        placeholder="Ex: Computador do caixa"
        required
      />

      <label htmlFor="problem">Descrição do problema</label>
      <textarea
        id="problem"
        value={problem}
        onChange={(event) => setProblem(event.target.value)}
        placeholder="Ex: Computador lento"
      />

      <label htmlFor="serviceDone">Serviço realizado</label>
      <textarea
        id="serviceDone"
        value={serviceDone}
        onChange={(event) => setServiceDone(event.target.value)}
        placeholder="Ex: Formatação e limpeza"
      />

      <label htmlFor="status">Status</label>
      <select
        id="status"
        value={status}
        onChange={(event) => setStatus(event.target.value as ServiceStatus)}
      >
        {SERVICE_STATUSES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <button type="submit">Adicionar serviço</button>
    </form>
  )
}

export default ServiceForm
