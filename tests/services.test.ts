import { describe, expect, test } from 'vitest'
import {
  allowedStatuses,
  changeStatus,
  createService,
  sortByUrgency,
  updateDiagnosis,
  updateServiceDone,
  updateUrgency,
} from '../src/services'
import type { Service } from '../src/types'

const novoServico = {
  client: 'Padaria Pão Quente',
  equipment: 'Computador do caixa',
  problem: 'Computador lento',
  serviceDone: '',
}

function servicoEm(status: Service['status'], serviceDone = ''): Service {
  return { ...createService({ ...novoServico, serviceDone }), status }
}

describe('a) cadastro', () => {
  test('cria o serviço com cliente e equipamento, sempre em Recebido', () => {
    const servico = createService(novoServico)

    expect(servico.client).toBe('Padaria Pão Quente')
    expect(servico.equipment).toBe('Computador do caixa')
    expect(servico.status).toBe('Recebido')
    expect(servico.id).toBeTruthy()
  })

  test('dá erro quando falta o cliente', () => {
    expect(() => createService({ ...novoServico, client: '' })).toThrow('Cliente é obrigatório')
  })

  test('dá erro quando falta o equipamento', () => {
    expect(() => createService({ ...novoServico, equipment: '' })).toThrow(
      'Equipamento é obrigatório',
    )
  })

  test('campo só com espaços conta como vazio', () => {
    expect(() => createService({ ...novoServico, client: '   ' })).toThrow('Cliente é obrigatório')
  })

  test('dá erro quando falta a descrição do problema', () => {
    expect(() => createService({ ...novoServico, problem: '' })).toThrow(
      'Descrição do problema é obrigatória',
    )
  })

  test('cadastra sem serviço realizado: ele só é exigido ao concluir', () => {
    expect(createService({ ...novoServico, serviceDone: '' }).serviceDone).toBe('')
  })
})

describe('b) ordem do status', () => {
  test('avança um passo: Recebido → Em análise', () => {
    expect(changeStatus(servicoEm('Recebido'), 'Em análise').status).toBe('Em análise')
  })

  test('volta um passo: Em manutenção → Em análise', () => {
    expect(changeStatus(servicoEm('Em manutenção'), 'Em análise').status).toBe('Em análise')
  })

  test('dá erro ao pular etapa: Recebido → Concluído', () => {
    expect(() => changeStatus(servicoEm('Recebido', 'Formatação'), 'Concluído')).toThrow(
      'um passo por vez',
    )
  })

  test('dá erro ao voltar mais de um passo: Em manutenção → Recebido', () => {
    expect(() => changeStatus(servicoEm('Em manutenção'), 'Recebido')).toThrow('um passo por vez')
  })

  test('não altera o serviço original', () => {
    const servico = servicoEm('Recebido')
    changeStatus(servico, 'Em análise')
    expect(servico.status).toBe('Recebido')
  })
})

describe('c) concluir exige serviço realizado', () => {
  test('dá erro ao concluir com serviço realizado vazio', () => {
    expect(() => changeStatus(servicoEm('Em manutenção'), 'Concluído')).toThrow(
      'Preencha o serviço realizado',
    )
  })

  test('conclui quando o serviço realizado está preenchido', () => {
    const servico = servicoEm('Em manutenção', 'Formatação e limpeza')
    expect(changeStatus(servico, 'Concluído').status).toBe('Concluído')
  })
})

describe('registrar o serviço realizado depois do cadastro', () => {
  test('registra o serviço realizado num serviço em andamento', () => {
    const servico = servicoEm('Em manutenção')
    expect(updateServiceDone(servico, 'Troca do HD por SSD').serviceDone).toBe('Troca do HD por SSD')
  })

  test('com o serviço realizado registrado, dá pra concluir', () => {
    const servico = updateServiceDone(servicoEm('Em manutenção'), 'Troca do HD por SSD')
    expect(changeStatus(servico, 'Concluído').status).toBe('Concluído')
  })

  test('dá erro ao apagar o serviço realizado de um serviço Concluído', () => {
    const servico = servicoEm('Concluído', 'Formatação e limpeza')
    expect(() => updateServiceDone(servico, '  ')).toThrow('Serviço concluído precisa')
  })
})

describe('salvar o serviço realizado conclui quando está Em manutenção', () => {
  test('Em manutenção + serviço realizado salvo → Concluído', () => {
    const servico = updateServiceDone(servicoEm('Em manutenção'), 'Limpeza interna')
    expect(servico.status).toBe('Concluído')
  })

  test('Em análise + serviço realizado salvo → continua Em análise', () => {
    const servico = updateServiceDone(servicoEm('Em análise'), 'Diagnóstico: fonte queimada')
    expect(servico.status).toBe('Em análise')
  })

  test('Em manutenção + texto vazio → continua Em manutenção', () => {
    const servico = updateServiceDone(servicoEm('Em manutenção'), '  ')
    expect(servico.status).toBe('Em manutenção')
  })
})

function servicoComDiagnostico(status: Service['status'], diagnosis: string): Service {
  return { ...servicoEm(status), diagnosis }
}

describe('d) diagnóstico antes de Em manutenção', () => {
  test('dá erro ao ir para Em manutenção sem diagnóstico', () => {
    expect(() => changeStatus(servicoComDiagnostico('Em análise', ''), 'Em manutenção')).toThrow(
      'Preencha o diagnóstico antes de colocar o serviço Em manutenção',
    )
  })

  test('diagnóstico só com espaços conta como vazio', () => {
    expect(() => changeStatus(servicoComDiagnostico('Em análise', '   '), 'Em manutenção')).toThrow(
      'Preencha o diagnóstico',
    )
  })

  test('com diagnóstico, avança para Em manutenção', () => {
    const servico = servicoComDiagnostico('Em análise', 'Fonte queimada, precisa trocar')
    expect(changeStatus(servico, 'Em manutenção').status).toBe('Em manutenção')
  })
})

describe('registrar o diagnóstico', () => {
  test('cadastra sem diagnóstico: ele só é exigido ao ir para Em manutenção', () => {
    expect(createService(novoServico).diagnosis).toBe('')
  })

  test('registra o diagnóstico sem mudar o status', () => {
    const servico = updateDiagnosis(servicoEm('Em análise'), '  HD com setores defeituosos  ')
    expect(servico.diagnosis).toBe('HD com setores defeituosos')
    expect(servico.status).toBe('Em análise')
  })

  test('dá erro ao apagar o diagnóstico de um serviço Em manutenção', () => {
    const servico = servicoComDiagnostico('Em manutenção', 'Fonte queimada')
    expect(() => updateDiagnosis(servico, '  ')).toThrow(
      'Serviço Em manutenção ou Concluído precisa ter o diagnóstico preenchido',
    )
  })

  test('dá erro ao apagar o diagnóstico de um serviço Concluído', () => {
    const servico = { ...servicoComDiagnostico('Concluído', 'Fonte queimada'), serviceDone: 'Troca da fonte' }
    expect(() => updateDiagnosis(servico, '')).toThrow('precisa ter o diagnóstico preenchido')
  })

  test('fluxo completo: cadastrar → Em análise → diagnóstico → Em manutenção → serviço realizado → Concluído', () => {
    let servico = createService(novoServico)
    servico = changeStatus(servico, 'Em análise')
    servico = updateDiagnosis(servico, 'Memória RAM insuficiente')
    servico = changeStatus(servico, 'Em manutenção')
    servico = updateServiceDone(servico, 'Instalação de mais 8 GB de RAM')

    expect(servico.status).toBe('Concluído')
    expect(servico.diagnosis).toBe('Memória RAM insuficiente')
    expect(servico.serviceDone).toBe('Instalação de mais 8 GB de RAM')
  })
})

describe('para quais status o serviço pode ir (colunas do quadro)', () => {
  test('Recebido só pode ir para Em análise', () => {
    expect(allowedStatuses(servicoEm('Recebido'))).toEqual(['Em análise'])
  })

  test('Em análise sem diagnóstico só pode voltar para Recebido', () => {
    expect(allowedStatuses(servicoComDiagnostico('Em análise', ''))).toEqual(['Recebido'])
  })

  test('Em análise com diagnóstico pode voltar ou ir para Em manutenção', () => {
    expect(allowedStatuses(servicoComDiagnostico('Em análise', 'Fonte queimada'))).toEqual([
      'Recebido',
      'Em manutenção',
    ])
  })

  test('Em manutenção sem serviço realizado só pode voltar para Em análise', () => {
    expect(allowedStatuses(servicoComDiagnostico('Em manutenção', 'Fonte queimada'))).toEqual([
      'Em análise',
    ])
  })

  test('Concluído só pode voltar para Em manutenção', () => {
    const servico = { ...servicoComDiagnostico('Concluído', 'Fonte queimada'), serviceDone: 'Troca da fonte' }
    expect(allowedStatuses(servico)).toEqual(['Em manutenção'])
  })
})

describe('nível de urgência', () => {
  test('cadastra com a urgência escolhida', () => {
    expect(createService({ ...novoServico, urgency: 'Crítica' }).urgency).toBe('Crítica')
  })

  test('sem urgência escolhida, cadastra como Média', () => {
    expect(createService(novoServico).urgency).toBe('Média')
  })

  test('dá erro com urgência que não existe', () => {
    expect(() =>
      createService({ ...novoServico, urgency: 'Altíssima' as Service['urgency'] }),
    ).toThrow('Escolha a urgência: Baixa, Média, Alta ou Crítica')
  })

  test('muda a urgência depois do cadastro sem mudar o status', () => {
    const servico = updateUrgency(servicoEm('Em manutenção'), 'Alta')
    expect(servico.urgency).toBe('Alta')
    expect(servico.status).toBe('Em manutenção')
  })

  test('muda a urgência mesmo de um serviço Concluído', () => {
    const concluido = { ...servicoComDiagnostico('Concluído', 'Fonte queimada'), serviceDone: 'Troca da fonte' }
    expect(updateUrgency(concluido, 'Baixa').urgency).toBe('Baixa')
  })

  test('dá erro ao mudar para uma urgência que não existe', () => {
    expect(() => updateUrgency(servicoEm('Recebido'), 'Urgentíssima' as Service['urgency'])).toThrow(
      'Escolha a urgência: Baixa, Média, Alta ou Crítica',
    )
  })

  test('ordena do mais urgente para o menos urgente', () => {
    const servicos = (['Baixa', 'Crítica', 'Média', 'Alta'] as const).map((urgency) =>
      createService({ ...novoServico, client: urgency, urgency }),
    )
    expect(sortByUrgency(servicos).map((s) => s.urgency)).toEqual(['Crítica', 'Alta', 'Média', 'Baixa'])
  })

  test('com a mesma urgência, quem chegou primeiro fica em cima', () => {
    const primeiro = createService({ ...novoServico, client: 'Primeiro', urgency: 'Alta' })
    const segundo = createService({ ...novoServico, client: 'Segundo', urgency: 'Alta' })
    const baixa = createService({ ...novoServico, client: 'Baixa', urgency: 'Baixa' })
    expect(sortByUrgency([baixa, primeiro, segundo]).map((s) => s.client)).toEqual([
      'Primeiro',
      'Segundo',
      'Baixa',
    ])
  })

  test('não altera a lista original', () => {
    const servicos = [
      createService({ ...novoServico, client: 'A', urgency: 'Baixa' }),
      createService({ ...novoServico, client: 'B', urgency: 'Crítica' }),
    ]
    sortByUrgency(servicos)
    expect(servicos.map((s) => s.client)).toEqual(['A', 'B'])
  })
})
