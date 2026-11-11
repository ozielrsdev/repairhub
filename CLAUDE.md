# RepairHub

Plataforma para assistências técnicas organizarem o atendimento dos equipamentos que os
clientes trazem: quem trouxe, o que deu problema, o orçamento, o que foi feito e em que pé
está. Vai ser vendida para várias assistências, e cada uma só enxerga os próprios dados.
Só o dono da assistência entra no sistema.

A visão está em `docs/visao-plataforma.md`, o plano e as decisões em
`docs/plano-plataforma.md`, os termos em `GLOSSARY.md` e as decisões de arquitetura em
`docs/adr/`. Use os termos do glossário (Assistência, Cliente, Ordem de Serviço, Comprovante…)
em código novo, telas e mensagens. Nota fiscal oficial está fora do escopo por agora.

## Stack

- React 19 + TypeScript, Vite. Validação com Zod. Testes com Vitest.
- Regras de negócio em `src/services.ts`, sem nada de tela. Componentes em `src/components/`.
- Supabase (ADR 0001) para banco, login e separação por assistência. As tabelas e o Row
  Level Security estão em `supabase/migrations/` (rodar no SQL Editor, em ordem). A leitura
  e a gravação no banco ficam em `src/repository.ts`, e o login em `src/auth.ts`.
- Variáveis no `.env.local` (ver `.env.example`). O teste de separação
  (`tests/isolamento.test.ts`) usa um projeto só de teste, com as variáveis
  `TEST_SUPABASE_*` no `.env.test.local`. Sem elas, ele aparece como "skipped".

## Comandos

- `npm install` — instala as dependências
- `npm run dev` — abre o sistema em http://localhost:5173 (precisa do `.env.local`)
- `npm test` — roda os testes
- `npm run build` — confere os tipos e gera a versão final
- `npm run lint` — confere o padrão do código

## Regras

- Os testes em `tests/` são a especificação. **Nunca edite um teste pra fazê-lo passar** —
  corrija o código. Acrescentar teste novo pode. Se uma regra mudar de verdade, o teste só
  muda com a minha aprovação explícita, e é reescrito antes do código.
- Antes de dizer que terminou, rode `npm test`, `npm run build` e `npm run lint` e mostre
  o resultado real.
- Antes de dizer que terminou, teste o fluxo completo do usuário, não só cada regra
  sozinha. Hoje: cadastrar → avançar o status → registrar o serviço realizado → concluir.
  Quando as fases chegarem lá: entrar → abrir OS com cliente → diagnóstico → orçamento →
  aprovar → manutenção → concluir → pagamento → comprovante → entregar. Se mudar uma regra,
  confira se a tela ainda deixa fazer esse caminho inteiro.
- Não instale nenhuma dependência sem me perguntar antes.
- Toda regra de negócio nova vai em `src/services.ts`, com teste escrito antes do código
  (skill `tdd`). Com o banco, as regras críticas (separação por assistência, mudanças de
  status, não apagar OS com comprovante emitido) também são garantidas no banco. Mensagens
  de erro em português, voltadas pra quem usa o sistema.
- Toda tabela nova tem o campo da assistência, regra de Row Level Security e um teste
  mostrando que outra assistência não lê nem altera os dados (ADR 0002).
- A chave secreta do Supabase (`service_role`) nunca vai para o front-end nem para o git.
- Dados pessoais de clientes (CPF, telefone, endereço) nunca aparecem em log nem em
  mensagem de erro.

## Como eu quero trabalhar com você

- Antes de criar ou mudar arquivos, me mostre o plano e espere eu confirmar.
- Se um pedido meu entrar em conflito com uma regra que já existe, me avise e me dê as
  opções antes de fazer.

## Onde este projeto está

- https://github.com/ozielrsdev/repairhub
