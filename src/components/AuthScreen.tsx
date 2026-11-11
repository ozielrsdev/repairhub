import { useState } from 'react'
import type { FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn, signUp } from '../auth'
import { validateAgencySignUp } from '../services'

interface AuthScreenProps {
  client: SupabaseClient
}

type Mode = 'entrar' | 'criar'

// Entrar e criar a conta da assistência. Só o dono entra no sistema.
function AuthScreen({ client }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>('entrar')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tradeName, setTradeName] = useState('')
  const [legalName, setLegalName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setNotice(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)

    try {
      if (mode === 'entrar') {
        await signIn(client, email, password)
        return
      }

      const agency = validateAgencySignUp({ tradeName, legalName, cnpj, phone })
      const signedIn = await signUp(client, email, password, agency)

      if (!signedIn) {
        setNotice(
          `Conta criada. Enviamos um link de confirmação para ${email.trim()}: abra o link e depois entre aqui.`,
        )
        setMode('entrar')
        setPassword('')
      }
    } catch (caught) {
      setError((caught as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex flex-1 items-start justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">
            {mode === 'entrar' ? 'Entrar' : 'Criar a conta da assistência'}
          </CardTitle>
          <CardDescription>
            {mode === 'entrar'
              ? 'Use o e-mail e a senha do dono da assistência.'
              : 'Só o dono da assistência entra no sistema.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            {mode === 'criar' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="trade-name">Nome fantasia *</Label>
                  <Input
                    id="trade-name"
                    value={tradeName}
                    onChange={(event) => setTradeName(event.target.value)}
                    placeholder="Ex: TecFix Informática"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="legal-name">Razão social *</Label>
                  <Input
                    id="legal-name"
                    value={legalName}
                    onChange={(event) => setLegalName(event.target.value)}
                    placeholder="Ex: TecFix Assistência Técnica Ltda"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      value={cnpj}
                      onChange={(event) => setCnpj(event.target.value)}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="(11) 90000-0000"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === 'entrar' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <Button type="submit" size="lg" disabled={busy}>
              {busy ? 'Aguarde…' : mode === 'entrar' ? 'Entrar' : 'Criar conta'}
            </Button>

            {error && (
              <p
                className="form-error rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-lg border bg-muted px-3 py-2 text-sm" role="status">
                {notice}
              </p>
            )}

            <Button
              type="button"
              variant="link"
              className="justify-self-center"
              onClick={() => switchMode(mode === 'entrar' ? 'criar' : 'entrar')}
            >
              {mode === 'entrar' ? 'Ainda não tem conta? Criar a conta da assistência' : 'Já tem conta? Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

export default AuthScreen
