# LOG-RED-GREEN-REFACTOR-1 — Oziel Sousa / orçamento zero ou negativo não substitui o orçamento já registrado

> Os cenários BDD da Semana 6 foram escritos no desafio `frontend-challenge`, outro projeto.
> Como as regras atuais do RepairHub já tinham teste, não daria para mostrar um teste
> falhando antes do código. Por isso escrevi 3 cenários novos, no mesmo formato
> Dado/Quando/Então, para regras que o RepairHub ainda não tinha. O cenário está no
> próprio arquivo de teste, em comentário acima do `describe`.

## Cenário

```gherkin
Cenário: orçamento zero ou negativo não substitui o orçamento já registrado
  Dado um serviço Em análise com orçamento de R$ 150
  Quando tento mudar o orçamento para R$ -50 ou para R$ 0
  Então aparece o erro "O orçamento precisa ser maior que zero"
  E o serviço continua com orçamento de R$ 150
```

## RED — o teste que ainda não passa

**Commit do teste (só o teste, nada de `src/`):**

```
d2e46a5 test: red — orçamento zero ou negativo não substitui o orçamento já registrado (falha, esperado)
```

**Saída do terminal rodando o teste:**

```
> repairhub@0.0.0 test
> vitest run


 RUN  v5.0.5 /home/oziel/Documentos/Projetos/repairhub

 ❯ tests/services.test.ts (42 tests | 1 failed) 24ms
   ❯ orçamento (1)
     × orçamento zero ou negativo não substitui o orçamento já registrado 4ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/services.test.ts > orçamento > orçamento zero ou negativo não substitui o orçamento já registrado
TypeError: updateBudget is not a function
 ❯ tests/services.test.ts:289:21
    287|   test('orçamento zero ou negativo não substitui o orçamento já regist…
    288|     // Dado
    289|     const servico = updateBudget(servicoEm('Em análise'), 150)
       |                     ^
    290|
    291|     // Quando / Então

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 41 passed (42)
   Start at  15:39:19
   Duration  332ms (import 70%, tests 16%, transform 10%, worker 4%)
```

**Por que esperávamos que falhasse assim:** A função `updateBudget` e o campo `budget` ainda não existiam no `src/`. O teste falha logo no "Dado", ao tentar registrar o primeiro orçamento (`updateBudget is not a function`).

## GREEN — o menor código que faz passar

**Commit da implementação:**

```
a2bef65 feat: green — orçamento só aceita valor maior que zero (teste passa)
```

**Saída do terminal com o teste passando:**

```
> repairhub@0.0.0 test
> vitest run


 RUN  v5.0.5 /home/oziel/Documentos/Projetos/repairhub


 Test Files  1 passed (1)
      Tests  42 passed (42)
   Start at  15:39:28
   Duration  310ms (import 57%, transform 28%, tests 12%, worker 3%)
```

**O que eu implementei e por que é o mínimo:** Campo `budget: number | null` no `Service` (começa `null` no cadastro) e a função `updateBudget`, que recusa qualquer valor que não seja maior que zero. Usei `!(budget > 0)` em vez de `budget <= 0` para recusar também `NaN`, que é o que chega da tela quando o campo fica vazio. Foi a única coisa além do que o teste pede.

## REFACTOR — o que eu limpei (se houve)

**O que mudou:** Não houve. O código novo tem 6 linhas e não repete nada.

**Confirmação:** `[x]` não houve refactor de código neste ciclo.

---

## Verificação de ordem

`git log --oneline -- tests/services.test.ts src/services.ts src/types.ts src/components src/App.tsx`
(do mais novo para o mais antigo):

```
0dfb07e test: troca o toBeTruthy do id por um teste que exige ids diferentes
51fb13f refactor: contador das colunas do quadro vem do countByStatus
af5cef6 refactor: resumo do quadro usa SERVICE_STATUSES em vez de repetir os status
05372ee feat: green — resumo do quadro conta quantos serviços há em cada status (teste passa)
98124ad test: red — resumo do quadro conta quantos serviços há em cada status (falha, esperado)
cfd065a feat: campo de orçamento no card do quadro
37b7487 feat: green — serviço sem orçamento não vai para Em manutenção (teste passa)
89f55ef test: red — serviço sem orçamento não vai para Em manutenção (falha, esperado)
a2bef65 feat: green — orçamento só aceita valor maior que zero (teste passa)
d2e46a5 test: red — orçamento zero ou negativo não substitui o orçamento já registrado (falha, esperado)
9d0791e feat: rodapé com autoria, direitos reservados e links do LinkedIn e GitHub
ce2f1d7 feat: seletor de status no card só em tela de toque
a6938f0 feat: quadro Kanban com arrastar, nível de urgência e visual com shadcn
ab2d60a feat: diagnóstico obrigatório antes de Em manutenção, com campo no card
```

O red `d2e46a5` aparece abaixo, ou seja, antes, do green `a2bef65`. Para conferir que o
commit red só tem teste: `git show --stat d2e46a5` lista apenas `tests/services.test.ts`.
