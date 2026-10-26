# RepairHub

Sistema para ajudar pequenos comércios a organizar serviços de manutenção de computadores e outros equipamentos.

## Problema

Pequenos comércios que dependem de computadores para trabalhar precisam realizar serviços de manutenção com frequência, como formatação, limpeza e troca de componentes. Muitas vezes, essas informações ficam espalhadas em conversas de WhatsApp, anotações ou planilhas, dificultando o acompanhamento dos equipamentos e dos serviços realizados. O projeto busca organizar essas informações em um único lugar, facilitando o controle dos clientes, equipamentos e serviços. Assim, o responsável pelo comércio consegue saber com mais facilidade o que foi feito, o que está pendente e quais equipamentos já passaram por manutenção.

## O que já funciona

- Cadastro de serviço com cliente, equipamento e descrição do problema (os três obrigatórios).
- Todo serviço novo começa em **Recebido**.
- Acompanhamento do status: **Recebido → Em análise → Em manutenção → Concluído**.
- Registro do diagnóstico e do serviço realizado direto no card, a qualquer momento.
- Mensagens de erro na tela quando uma regra é quebrada.

> Os dados ficam só na memória do navegador: somem ao recarregar a página. Salvar de
> verdade é o próximo passo.

## Regras de negócio

| regra | exemplo |
|---|---|
| Cliente, equipamento e descrição do problema são obrigatórios no cadastro | cadastrar sem equipamento → erro "Equipamento é obrigatório" |
| O status anda um passo por vez, pra frente ou pra trás | Recebido → Em análise funciona; Recebido → Concluído dá erro |
| Só vai para Em manutenção com o diagnóstico preenchido | Em análise → Em manutenção com o diagnóstico vazio dá erro |
| Serviço Em manutenção ou Concluído não pode ficar sem diagnóstico | apagar o diagnóstico de um serviço Em manutenção dá erro |
| Só conclui com o serviço realizado preenchido | Em manutenção → Concluído com o campo vazio dá erro |
| Salvar o serviço realizado de um serviço Em manutenção já o conclui | o botão vira "Salvar e concluir" |
| Serviço concluído não pode ficar sem serviço realizado | apagar o texto de um serviço Concluído dá erro |

Todas as regras estão em `src/services.ts` e têm teste em `tests/services.test.ts`.

## Como rodar

Precisa de Node.js 22.12 ou maior (`node -v`) — é o mínimo do Vitest.

```bash
npm install        # instala as dependências
npm run dev        # abre o sistema em http://localhost:5173
npm test           # roda os testes (Vitest)
npm run build      # confere os tipos e gera a versão final em dist/
npm run lint       # confere o padrão do código (ESLint)
```

## Estrutura

```
.
|-- src/
|   |-- services.ts            <- regras de negócio (cadastro, status, serviço realizado), sem tela
|   |-- types.ts               <- o tipo Service e a lista de status
|   |-- App.tsx                <- guarda a lista de serviços e liga a tela às regras
|   |-- components/
|   |   |-- ServiceForm.tsx    <- formulário de cadastro
|   |   `-- ServiceList.tsx    <- cards dos serviços: status, serviço realizado e erros
|   |-- App.css, index.css     <- estilos (cores do tema claro e escuro em index.css)
|   `-- main.tsx               <- ponto de entrada do React
|-- tests/
|   `-- services.test.ts       <- testes das regras de negócio
|-- .claude/skills/            <- skills do Claude Code usadas no projeto (tdd, domain-modeling)
|-- CLAUDE.md                  <- contexto e regras pro agente de IA
`-- package.json               <- dependências e comandos
```

## Tecnologias

- React 19 + TypeScript
- Vite (servidor de desenvolvimento e build)
- Zod (validação do cadastro)
- Vitest (testes)
- ESLint (padrão de código)

## Status

Em desenvolvimento. Projeto da Especialização em Desenvolvimento com IA da Programadores do Amanhã.
