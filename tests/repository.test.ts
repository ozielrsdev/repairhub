import { describe, expect, test } from 'vitest'
import { rowToService, serviceToRow } from '../src/repository'

// A linha do banco (supabase/migrations) usa os nomes em português, com _;
// o app usa o Service de src/types.ts.
describe('conversão entre o banco e o app', () => {
  test('converte a linha do banco em Service, com orçamento vazio como null', () => {
    expect(
      rowToService({
        id: '6f1c2e0a-0000-4000-8000-000000000001',
        cliente: 'Padaria Pão Quente',
        equipamento: 'Computador do caixa',
        problema: 'Computador lento',
        diagnostico: 'HD com setores defeituosos',
        servico_realizado: '',
        orcamento: null,
        urgencia: 'Alta',
        status: 'Em análise',
      }),
    ).toEqual({
      id: '6f1c2e0a-0000-4000-8000-000000000001',
      client: 'Padaria Pão Quente',
      equipment: 'Computador do caixa',
      problem: 'Computador lento',
      diagnosis: 'HD com setores defeituosos',
      serviceDone: '',
      budget: null,
      urgency: 'Alta',
      status: 'Em análise',
    })
  })

  test('converte o Service em linha do banco, sem a assistência (o banco preenche)', () => {
    expect(
      serviceToRow({
        id: '6f1c2e0a-0000-4000-8000-000000000002',
        client: 'Farmácia Bem Estar',
        equipment: 'Impressora fiscal',
        problem: 'Não imprime',
        diagnosis: 'Cabeça de impressão gasta',
        serviceDone: 'Troca da cabeça de impressão',
        budget: 320.5,
        urgency: 'Crítica',
        status: 'Concluído',
      }),
    ).toEqual({
      id: '6f1c2e0a-0000-4000-8000-000000000002',
      cliente: 'Farmácia Bem Estar',
      equipamento: 'Impressora fiscal',
      problema: 'Não imprime',
      diagnostico: 'Cabeça de impressão gasta',
      servico_realizado: 'Troca da cabeça de impressão',
      orcamento: 320.5,
      urgencia: 'Crítica',
      status: 'Concluído',
    })
  })
})
