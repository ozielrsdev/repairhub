import { useState } from 'react'
import ServiceForm from './components/ServiceForm'
import ServiceList from './components/ServiceList'
import { changeStatus, createService, updateDiagnosis, updateServiceDone } from './services'
import type { NewServiceInput } from './services'
import type { Service, ServiceStatus } from './types'
import './App.css'

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>RepairHub</h1>
        <p>Controle de serviços de manutenção</p>
      </header>

      <main className="app-main">
        <ServiceForm onAddService={handleAddService} />

        <section className="service-section">
          <h2>Serviços cadastrados</h2>
          <ServiceList
            services={services}
            onStatusChange={handleStatusChange}
            onDiagnosisChange={handleDiagnosisChange}
            onServiceDoneChange={handleServiceDoneChange}
          />
        </section>
      </main>
    </div>
  )
}

export default App
