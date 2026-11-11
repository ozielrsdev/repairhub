import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { LogOutIcon } from 'lucide-react'
import ServiceForm from './ServiceForm'
import ServiceBoard from './ServiceBoard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signOut } from '../auth'
import { insertService, loadAgency, loadServices, saveService } from '../repository'
import type { Agency } from '../repository'
import {
  changeStatus,
  createService,
  filterByClient,
  updateBudget,
  updateDiagnosis,
  updateServiceDone,
  updateUrgency,
} from '../services'
import type { NewServiceInput } from '../services'
import type { Service, ServiceStatus, Urgency } from '../types'

interface WorkspaceProps {
  client: SupabaseClient
}

// O quadro da assistência do dono logado. Cada mudança passa primeiro pela regra de
// src/services.ts e só aparece na tela depois de salva no banco. Os handlers devolvem a
// mensagem de erro da regra violada (ou do banco), ou null se deu certo.
function Workspace({ client }: WorkspaceProps) {
  const [agency, setAgency] = useState<Agency | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [clientQuery, setClientQuery] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([loadAgency(client), loadServices(client)])
      .then(([loadedAgency, loadedServices]) => {
        if (active) {
          setAgency(loadedAgency)
          setServices(loadedServices)
        }
      })
      .catch((error: Error) => {
        if (active) {
          setLoadError(error.message)
        }
      })

    return () => {
      active = false
    }
  }, [client])

  const visibleServices = filterByClient(services, clientQuery)

  async function handleAddService(input: NewServiceInput): Promise<string | null> {
    try {
      const service = createService(input)
      await insertService(client, service)
      setServices((current) => [...current, service])
      return null
    } catch (error) {
      return (error as Error).message
    }
  }

  async function updateService(
    id: string,
    update: (service: Service) => Service,
  ): Promise<string | null> {
    const service = services.find((item) => item.id === id)
    if (!service) {
      return 'Serviço não encontrado'
    }

    try {
      const updated = update(service)
      await saveService(client, updated)
      setServices((current) => current.map((item) => (item.id === id ? updated : item)))
      return null
    } catch (error) {
      return (error as Error).message
    }
  }

  function handleStatusChange(id: string, status: ServiceStatus) {
    return updateService(id, (service) => changeStatus(service, status))
  }

  function handleDiagnosisChange(id: string, diagnosis: string) {
    return updateService(id, (service) => updateDiagnosis(service, diagnosis))
  }

  function handleServiceDoneChange(id: string, serviceDone: string) {
    return updateService(id, (service) => updateServiceDone(service, serviceDone))
  }

  function handleBudgetChange(id: string, budget: number) {
    return updateService(id, (service) => updateBudget(service, budget))
  }

  function handleUrgencyChange(id: string, urgency: Urgency) {
    return updateService(id, (service) => updateUrgency(service, urgency))
  }

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">RepairHub</h1>
          <p className="text-muted-foreground">{agency?.tradeName ?? 'Carregando…'}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void signOut(client)}>
          <LogOutIcon data-icon="inline-start" />
          Sair
        </Button>
      </header>

      {loadError ? (
        <p
          className="form-error rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {loadError}
        </p>
      ) : (
        <main className="flex flex-1 flex-col gap-10">
          <ServiceForm onAddService={handleAddService} />

          <section className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-tight">Quadro de serviços</h2>
              <Input
                type="search"
                aria-label="Buscar por cliente"
                placeholder="Buscar por cliente"
                value={clientQuery}
                onChange={(event) => setClientQuery(event.target.value)}
                className="w-full sm:w-64"
              />
            </div>
            {/* Busca vazia devolve todos (regra do filterByClient), então lista vazia aqui
                só acontece quando a busca não achou ninguém. */}
            {services.length > 0 && visibleServices.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum serviço encontrado para "{clientQuery}".
              </p>
            )}
            <ServiceBoard
              services={visibleServices}
              onStatusChange={handleStatusChange}
              onDiagnosisChange={handleDiagnosisChange}
              onServiceDoneChange={handleServiceDoneChange}
              onUrgencyChange={handleUrgencyChange}
              onBudgetChange={handleBudgetChange}
            />
          </section>
        </main>
      )}
    </>
  )
}

export default Workspace
