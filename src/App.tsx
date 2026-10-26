import { useState } from 'react'
import ServiceForm from './components/ServiceForm'
import Footer from './components/Footer'
import ServiceBoard from './components/ServiceBoard'
import {
  changeStatus,
  createService,
  updateDiagnosis,
  updateServiceDone,
  updateUrgency,
} from './services'
import type { NewServiceInput } from './services'
import type { Service, ServiceStatus, Urgency } from './types'

// Os handlers devolvem a mensagem de erro da regra violada, ou null se deu certo.
function App() {
  const [services, setServices] = useState<Service[]>([])

  function handleAddService(input: NewServiceInput): string | null {
    try {
      const service = createService(input)
      setServices((current) => [...current, service])
      return null
    } catch (error) {
      return (error as Error).message
    }
  }

  function updateService(id: string, update: (service: Service) => Service): string | null {
    const service = services.find((item) => item.id === id)
    if (!service) {
      return 'Serviço não encontrado'
    }

    try {
      const updated = update(service)
      setServices((current) => current.map((item) => (item.id === id ? updated : item)))
      return null
    } catch (error) {
      return (error as Error).message
    }
  }

  function handleStatusChange(id: string, status: ServiceStatus): string | null {
    return updateService(id, (service) => changeStatus(service, status))
  }

  function handleDiagnosisChange(id: string, diagnosis: string): string | null {
    return updateService(id, (service) => updateDiagnosis(service, diagnosis))
  }

  function handleServiceDoneChange(id: string, serviceDone: string): string | null {
    return updateService(id, (service) => updateServiceDone(service, serviceDone))
  }

  function handleUrgencyChange(id: string, urgency: Urgency): string | null {
    return updateService(id, (service) => updateUrgency(service, urgency))
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6">
      <header className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight">RepairHub</h1>
        <p className="mt-1 text-muted-foreground">Controle de serviços de manutenção</p>
      </header>

      <main className="flex flex-1 flex-col gap-10">
        <ServiceForm onAddService={handleAddService} />

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Quadro de serviços</h2>
          <ServiceBoard
            services={services}
            onStatusChange={handleStatusChange}
            onDiagnosisChange={handleDiagnosisChange}
            onServiceDoneChange={handleServiceDoneChange}
            onUrgencyChange={handleUrgencyChange}
          />
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default App
