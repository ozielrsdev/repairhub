# RepairHub

Plataforma para assistências técnicas organizarem o atendimento dos equipamentos que os clientes trazem.
Cada assistência tem a sua conta e só enxerga os próprios dados.

> Em transição: o RepairHub está virando uma plataforma vendida para assistências técnicas.
> A visão está em [`docs/visao-plataforma.md`](docs/visao-plataforma.md), o plano e as
> decisões em [`docs/plano-plataforma.md`](docs/plano-plataforma.md) e os termos em
> [`GLOSSARY.md`](GLOSSARY.md). Esta é a Fase 1: conta da assistência, login e dados salvos.

## Problema

Assistências técnicas recebem equipamentos todo dia e controlam o atendimento em conversas de WhatsApp, cadernos ou planilhas: quem trouxe, o que deu problema, quanto foi orçado, o que foi feito e se o cliente já retirou. Fica difícil saber o que está pendente e explicar ao cliente o que ele está pagando. O RepairHub organiza tudo isso em um único lugar, para cada assistência, e no fim gera um comprovante claro para o cliente.

## O que já funciona

- Conta da assistência: o dono cria a conta com e-mail, senha, nome fantasia, razão social,
  CNPJ (validado, inclusive o alfanumérico) e telefone, confirma o e-mail e entra. Só o dono
  entra no sistema.
- Os serviços ficam salvos no banco (Supabase): continuam lá ao recarregar a página ou
  entrar de outro computador. Cada assistência só vê os próprios.
- Cadastro de serviço com cliente, equipamento e descrição do problema (os três obrigatórios).
- Todo serviço novo começa em **Recebido**.
- Acompanhamento do status: **Recebido → Em análise → Em manutenção → Concluído**.
- Quadro Kanban com uma coluna por status: o card muda de coluna sozinho quando o status
  muda. No computador, o status muda arrastando o card (as colunas permitidas ficam
  destacadas) ou pelo seletor em **Ver detalhes**, pra quem usa teclado. Em tela de toque
  (celular e tablet), onde não dá pra arrastar, o seletor de status fica no próprio card.
- Nível de urgência (Baixa, Média, Alta, Crítica) com ícone no card; os mais urgentes
  ficam no topo de cada coluna.
- Card resumido (cliente, urgência, equipamento e problema); em **Ver detalhes** dá pra
  registrar o diagnóstico, o orçamento e o serviço realizado e trocar a urgência, a qualquer momento.
- Cada coluna do quadro mostra quantos serviços estão naquele status.
- Busca por cliente acima do quadro: mostra só os serviços cujo cliente contém o texto
  digitado, sem diferença entre maiúsculas e minúsculas. Com a busca vazia, aparecem
  todos; se ninguém for encontrado, aparece um aviso. O contador de cada coluna conta só
  os serviços que a busca mostra.
- Mensagens de erro na tela quando uma regra é quebrada.


## Regras de negócio

| regra | exemplo |
|---|---|
| Cliente, equipamento e descrição do problema são obrigatórios no cadastro | cadastrar sem equipamento → erro "Equipamento é obrigatório" |
| O status anda um passo por vez, pra frente ou pra trás | Recebido → Em análise funciona; Recebido → Concluído dá erro |
| Só vai para Em manutenção com o diagnóstico preenchido | Em análise → Em manutenção com o diagnóstico vazio dá erro |
| Só vai para Em manutenção com o orçamento registrado | Em análise → Em manutenção sem orçamento dá erro |
| O orçamento precisa ser maior que zero | orçamento de R$ -50 ou R$ 0 dá erro e o valor anterior fica |
| Serviço Em manutenção ou Concluído não pode ficar sem diagnóstico | apagar o diagnóstico de um serviço Em manutenção dá erro |
| Só conclui com o serviço realizado preenchido | Em manutenção → Concluído com o campo vazio dá erro |
| Salvar o serviço realizado de um serviço Em manutenção já o conclui | o botão vira "Salvar e concluir" |
| Serviço concluído não pode ficar sem serviço realizado | apagar o texto de um serviço Concluído dá erro |
| Urgência é Baixa, Média, Alta ou Crítica; sem escolher, fica Média | urgência "Altíssima" dá erro |
| A urgência pode mudar em qualquer status, sem mexer no status | mudar de Baixa para Alta num serviço Concluído funciona |
| Em cada coluna, os mais urgentes ficam em cima; empate, quem chegou primeiro | Crítica, depois Alta, Média e Baixa |
| A busca por cliente acha parte do nome, sem diferença entre maiúsculas e minúsculas; busca vazia mostra todos | buscar "padaria" mostra "Padaria Pão Quente" e "Padaria Central" |
| A conta da assistência exige nome fantasia, razão social e CNPJ válido | CNPJ 11.222.333/0001-82 dá erro "CNPJ inválido: confira os números digitados" |
| O CNPJ pode ter letras nos 12 primeiros caracteres (Receita, desde julho de 2026) | 12.ABC.345/01DE-35 é aceito |
| Um CNPJ só pode ter uma conta | criar conta com um CNPJ já usado dá erro |
| Cada assistência só lê e altera os próprios dados | uma assistência não vê nem altera os serviços de outra |

As regras estão em `src/services.ts` e têm teste em `tests/services.test.ts`. A separação
entre assistências é garantida no banco (Row Level Security, em `supabase/migrations/`) e
tem teste em `tests/isolamento.test.ts`.

## Como rodar

Precisa de Node.js 22.12 ou maior (`node -v`) — é o mínimo do Vitest — e de um projeto
no [Supabase](https://supabase.com) (o plano grátis serve).

### Configurar o Supabase (uma vez)

1. Crie um projeto no Supabase.
2. No **SQL Editor** do projeto, rode o conteúdo de
   `supabase/migrations/0001_assistencias_e_os.sql`.
3. Em **Authentication → URL Configuration**, coloque o endereço do app em **Site URL**
   (`http://localhost:5173` para rodar na sua máquina) e o endereço da Vercel em
   **Redirect URLs**. É para onde o link de confirmação de e-mail leva.
4. Copie o `.env.example` para `.env.local` e preencha `VITE_SUPABASE_URL` e
   `VITE_SUPABASE_ANON_KEY` com os dados de **Project Settings → API**. A chave
   `service_role` nunca vai no `.env.local` nem no front-end.
5. Na Vercel, coloque as mesmas duas variáveis em **Settings → Environment Variables**.

Para o teste de separação entre assistências, crie um **segundo projeto, só de teste**
(o teste cria e apaga contas), rode o mesmo SQL nele e preencha as variáveis
`TEST_SUPABASE_*` num `.env.test.local` (ver `.env.example`). Sem elas, esse teste é
pulado e aparece como "skipped".

### Comandos

```bash
npm install        # instala as dependências
npm run dev        # abre o sistema em http://localhost:5173
npm test           # roda os testes (Vitest)
npm run build      # confere os tipos e gera a versão final em dist/
npm run lint       # confere o padrão do código (ESLint)
npm run typecheck  # confere os tipos (TypeScript)
npm run verify     # roda lint, typecheck, build e testes em sequência
```

O GitHub roda essas mesmas checagens (mais o `npm audit` e a revisão de dependências) em
todo PR, e a `main` só aceita merge com todas verdes. Ver `.github/workflows/ci.yml` e
`docs/semana8/ENTREGAVEL.md`.

## Estrutura

```
.
|-- src/
|   |-- services.ts            <- regras de negócio (cadastro, status, conta da assistência), sem tela
|   |-- types.ts               <- o tipo Service e a lista de status
|   |-- repository.ts          <- ler e salvar no banco (Supabase)
|   |-- auth.ts                <- entrar, criar conta e sair, com mensagens em português
|   |-- lib/supabase.ts        <- conexão com o Supabase (variáveis do .env.local)
|   |-- App.tsx                <- mostra a tela de entrar ou o quadro, conforme o login
|   |-- components/
|   |   |-- AuthScreen.tsx     <- entrar e criar a conta da assistência
|   |   |-- Workspace.tsx      <- o quadro da assistência: carrega, aplica as regras e salva
|   |   |-- ServiceForm.tsx    <- formulário de cadastro
|   |   |-- ui/                <- componentes do shadcn (gerados pelo CLI, evite editar)
|   |   |-- Footer.tsx         <- rodapé: autoria, direitos e links do LinkedIn e GitHub
|   |   |-- ServiceBadges.tsx  <- selos de status e de urgência (com ícone)
|   |   |-- ServiceBoard.tsx   <- quadro Kanban: colunas por status e arrastar/soltar
|   |   `-- ServiceCard.tsx    <- card de um serviço: resumo, detalhes, status e erros
|   |-- index.css              <- tema do shadcn (cores claro/escuro) e Tailwind
|   `-- main.tsx               <- ponto de entrada do React
|-- supabase/migrations/       <- tabelas e Row Level Security (rodar no SQL Editor)
|-- tests/
|   |-- services.test.ts       <- testes das regras de negócio
|   |-- repository.test.ts     <- conversão entre o banco e o app
|   `-- isolamento.test.ts     <- uma assistência não lê nem altera dados de outra
|-- docs/                      <- visão, plano, ADRs e entregas do curso
|-- .claude/skills/            <- skills do Claude Code usadas no projeto (tdd, domain-modeling, nova-regra)
|-- .claude/agents/            <- subagentes de revisão (sinais de IA, segurança)
|-- GLOSSARY.md                <- os termos do domínio
|-- CLAUDE.md                  <- contexto e regras pro agente de IA
`-- package.json               <- dependências e comandos
```

## Tecnologias

- React 19 + TypeScript
- Vite (servidor de desenvolvimento e build)
- Zod (validação do cadastro)
- Supabase (banco Postgres, login e Row Level Security)
- Tailwind CSS 4 + shadcn/ui (componentes em `src/components/ui/`, ícones lucide-react)
- Vitest (testes)
- ESLint (padrão de código)

## Status

Em desenvolvimento. Projeto da Especialização em Desenvolvimento com IA da Programadores do Amanhã.
