import { describe, expect, test } from 'vitest'
import { changeStatus, createService, updateDiagnosis, updateServiceDone } from '../src/services'
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
