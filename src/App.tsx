import { useState } from 'react'
import ServiceForm from './components/ServiceForm'
import ServiceList from './components/ServiceList'
import type { Service, ServiceStatus } from './types'
import './App.css'

function App() {
  const [services, setServices] = useState<Service[]>([])

  function handleAddService(newService: Omit<Service, 'id'>) {
    const service: Service = { ...newService, id: crypto.randomUUID() }
    setServices((current) => [...current, service])
  }

  function handleStatusChange(id: string, status: ServiceStatus) {
    setServices((current) =>
      current.map((service) => (service.id === id ? { ...service, status } : service)),
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>TechControl</h1>
        <p>Controle de serviços de manutenção</p>
      </header>

      <main className="app-main">
        <ServiceForm onAddService={handleAddService} />

        <section className="service-section">
          <h2>Serviços cadastrados</h2>
          <ServiceList services={services} onStatusChange={handleStatusChange} />
        </section>
      </main>
    </div>
  )
}

export default App
