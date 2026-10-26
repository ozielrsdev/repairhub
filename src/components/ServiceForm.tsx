import { useState } from 'react'
import type { FormEvent } from 'react'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { NewServiceInput } from '../services'
import { URGENCY_LEVELS } from '../types'
import type { Urgency } from '../types'
import { UrgencyLabel } from './ServiceBadges'

interface ServiceFormProps {
  onAddService: (input: NewServiceInput) => string | null
}

function ServiceForm({ onAddService }: ServiceFormProps) {
  const [client, setClient] = useState('')
  const [equipment, setEquipment] = useState('')
  const [problem, setProblem] = useState('')
  const [urgency, setUrgency] = useState<Urgency>('Média')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = onAddService({ client, equipment, problem, urgency })
    setError(result)

    if (result) {
      return
    }

    setClient('')
    setEquipment('')
    setProblem('')
    setUrgency('Média')
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Novo serviço</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="client">Cliente *</Label>
              <Input
                id="client"
                value={client}
                onChange={(event) => setClient(event.target.value)}
                placeholder="Nome do cliente"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="equipment">Equipamento *</Label>
              <Input
                id="equipment"
                value={equipment}
                onChange={(event) => setEquipment(event.target.value)}
                placeholder="Ex: Computador do caixa"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="problem">Descrição do problema *</Label>
            <Textarea
              id="problem"
              value={problem}
              onChange={(event) => setProblem(event.target.value)}
              placeholder="Ex: Computador lento"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="urgency">Urgência</Label>
            <Select value={urgency} onValueChange={(value) => setUrgency(value as Urgency)}>
              <SelectTrigger id="urgency" className="w-full sm:w-48">
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

          <Button type="submit" size="lg" className="justify-self-start px-4">
            <PlusIcon data-icon="inline-start" />
            Adicionar serviço
          </Button>

          {error && (
            <p
              className="form-error rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

export default ServiceForm
