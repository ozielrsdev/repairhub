import { useState } from 'react'
import type { FormEvent } from 'react'
import type { NewServiceInput } from '../services'

interface ServiceFormProps {
  onAddService: (input: NewServiceInput) => string | null
}

function ServiceForm({ onAddService }: ServiceFormProps) {
  const [client, setClient] = useState('')
  const [equipment, setEquipment] = useState('')
  const [problem, setProblem] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = onAddService({ client, equipment, problem })
    setError(result)

    if (result) {
      return
    }

    setClient('')
    setEquipment('')
    setProblem('')
  }

  return (
    <form className="service-form" onSubmit={handleSubmit}>
      <h2>Novo serviço</h2>

      <label htmlFor="client">Cliente *</label>
      <input
        id="client"
        type="text"
        value={client}
        onChange={(event) => setClient(event.target.value)}
        placeholder="Nome do cliente"
      />

      <label htmlFor="equipment">Equipamento *</label>
      <input
        id="equipment"
        type="text"
        value={equipment}
        onChange={(event) => setEquipment(event.target.value)}
        placeholder="Ex: Computador do caixa"
      />

      <label htmlFor="problem">Descrição do problema *</label>
      <textarea
        id="problem"
        value={problem}
        onChange={(event) => setProblem(event.target.value)}
        placeholder="Ex: Computador lento"
      />

      <button type="submit">Adicionar serviço</button>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

export default ServiceForm
