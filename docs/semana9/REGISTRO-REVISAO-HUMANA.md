# Registro de revisão humana — PR: https://github.com/ozielrsdev/repairhub/pull/6

**Revisor:** Oziel Sousa
**Autor do PR:** agente (Claude Code), a meu pedido: feature "buscar por cliente"
**Início da revisão:** 16:10

> Este arquivo foi commitado antes de rodar `revisor-sinais-ia` e `revisor-seguranca-ia`
> no PR #6, e não é mais editado depois do commit.

## Como eu li

- [x] Camada 1 — `git diff --stat`: 3 arquivos, +56 −2 (`src/App.tsx` +24, `src/services.ts` +12,
      `tests/services.test.ts` +22). Pedi para o agente rodar e li a saída.
- [x] Camada 2 — testes, lint e type check: 47 testes verdes, lint e type check limpos, local e
      no CI. Pedi para o agente rodar e li a saída.
- [ ] Camada 3 — não fiz a separação formal de arquivo de risco vs. trivial.
- [~] Camada 4 — li parte do código na aba "Files changed" do PR.
- [x] Além das camadas: usei a busca e o quadro na tela, como o técnico usaria.

## Achados

Nenhum achado no código da busca em si: buscar "padaria" mostra só as padarias e a farmácia
não aparece, que é o que eu esperava. Os achados abaixo são de uso do quadro. Eu os vi
revisando o PR, mas estão em partes que **o PR não mudou**.

1. **Onde:** `src/components/ServiceCard.tsx`, botão "Ver detalhes"
   **O que:** com o card aberto, o botão de fechar fica lá embaixo, e procurar por ele toda vez
   é cansativo. Mudaria para um modal ao clicar no card, ou um botão "+" no canto de cima.
   **Bloqueia?** não — **Por quê:** é fora do que o PR mudou. A busca pode entrar, e isso vira
   um PR próprio.

2. **Onde:** card do quadro, troca de status
   **O que:** queria botões dizendo para onde o serviço vai ("Enviar para análise",
   "Manutenção", "Concluído"), em vez de só arrastar ou usar o seletor.
   **Bloqueia?** não — **Por quê:** fora do escopo do PR. É melhoria de uso para outro PR.

3. **Onde:** regra "o status anda um passo por vez" (`changeStatus` em `src/services.ts`)
   **O que:** voltar um passo por vez é cansativo. Para mim, voltar deveria poder pular
   etapas, mas só até **Em análise**: depois que o serviço foi recebido, não precisa voltar
   para Recebido. Avançar continua um passo por vez.
   **Bloqueia?** não — **Por quê:** muda uma regra de negócio que já existe. Precisa de teste
   antes e de um PR próprio, não cabe na busca.

4. **Onde:** passagem para Concluído
   **O que:** antes de concluir, um modal para descrever o que foi feito e preencher os valores
   e o serviço realizado de uma vez.
   **Bloqueia?** não — **Por quê:** fora do escopo do PR. É ideia de melhoria para depois.

## O que eu decidi NÃO reportar (e por quê)

- A busca em si: fez o que eu esperava no uso normal, então não tenho o que pedir para mudar.

## Fim da revisão

**Horário do commit:** ver `git log` em `REGISTRO-SUBAGENTE.md` / `REGISTRO-COMPARACAO.csv`.
