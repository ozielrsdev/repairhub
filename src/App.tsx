import { useEffect, useState } from 'react'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import AuthScreen from './components/AuthScreen'
import Footer from './components/Footer'
import Workspace from './components/Workspace'
import { supabase } from './lib/supabase'

// Sem login, a tela de entrar; com login, o quadro da assistência. undefined = ainda
// conferindo se já tem sessão salva no navegador.
function SessionGate({ client }: { client: SupabaseClient }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    client.auth.getSession().then(({ data }) => setSession(data.session))

    const { data } = client.auth.onAuthStateChange((_event, newSession) => setSession(newSession))
    return () => data.subscription.unsubscribe()
  }, [client])

  if (session === undefined) {
    return <p className="text-center text-muted-foreground">Carregando…</p>
  }

  if (session === null) {
    return (
      <>
        <header className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight">RepairHub</h1>
          <p className="mt-1 text-muted-foreground">Controle de serviços de manutenção</p>
        </header>
        <AuthScreen client={client} />
      </>
    )
  }

  // key: trocar de conta recria o quadro do zero, sem dados da conta anterior.
  return <Workspace key={session.user.id} client={client} />
}

function App() {
  return (
    <div className="mx-auto flex min-h-svh max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6">
      {supabase ? (
        <SessionGate client={supabase} />
      ) : (
        <p
          className="form-error mx-auto max-w-xl rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          O RepairHub não está configurado: faltam VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
          Veja o .env.example e o README.
        </p>
      )}
      <Footer />
    </div>
  )
}

export default App
