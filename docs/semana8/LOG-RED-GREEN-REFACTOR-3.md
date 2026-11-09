# LOG-RED-GREEN-REFACTOR-3 — Oziel Sousa / resumo do quadro conta quantos serviços há em cada status

> Os cenários BDD da Semana 6 foram escritos no desafio `frontend-challenge`, outro projeto.
> Como as regras atuais do RepairHub já tinham teste, não daria para mostrar um teste
> falhando antes do código. Por isso escrevi 3 cenários novos, no mesmo formato
> Dado/Quando/Então, para regras que o RepairHub ainda não tinha. O cenário está no
> próprio arquivo de teste, em comentário acima do `describe`.

## Cenário

```gherkin
Cenário: resumo do quadro conta quantos serviços há em cada status
  Dado 2 serviços Recebido, 1 Em manutenção e 1 Concluído
  Quando peço o resumo do quadro
  Então vejo Recebido 2, Em análise 0, Em manutenção 1 e Concluído 1
```

## RED — o teste que ainda não passa

**Commit do teste (só o teste, nada de `src/`):**

```
98124ad test: red — resumo do quadro conta quantos serviços há em cada status (falha, esperado)
```

**Saída do terminal rodando o teste:**

```
> repairhub@0.0.0 test
> vitest run


 RUN  v5.0.5 /home/oziel/Documentos/Projetos/repairhub

 ❯ tests/services.test.ts (44 tests | 1 failed) 25ms
   ❯ resumo do quadro (1)
     × resumo do quadro conta quantos serviços há em cada status 4ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/services.test.ts > resumo do quadro > resumo do quadro conta quantos serviços há em cada status
TypeError: countByStatus is not a function
 ❯ tests/services.test.ts:340:20
    338|
    339|     // Quando
    340|     const resumo = countByStatus(servicos)
       |                    ^
    341|
    342|     // Então

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 43 passed (44)
   Start at  15:41:28
   Duration  254ms (import 52%, transform 28%, tests 17%, worker 3%)
```

**Por que esperávamos que falhasse assim:** A função `countByStatus` ainda não existia (`countByStatus is not a function`).

## GREEN — o menor código que faz passar

**Commit da implementação:**

```
05372ee feat: green — resumo do quadro conta quantos serviços há em cada status (teste passa)
```

**Saída do terminal com o teste passando:**

```
> repairhub@0.0.0 test
> vitest run


 RUN  v5.0.5 /home/oziel/Documentos/Projetos/repairhub


 Test Files  1 passed (1)
      Tests  44 passed (44)
   Start at  15:41:35
   Duration  267ms (import 65%, transform 19%, tests 13%, worker 2%)
```

**O que eu implementei e por que é o mínimo:** A função `countByStatus`, com um objeto começando em zero para os 4 status e um laço somando 1 no status de cada serviço. Os 4 status estavam escritos à mão: era o mínimo, e virou o alvo do refactor.

## REFACTOR — o que eu limpei (se houve)

**Commit do refactor:**

```
af5cef6 refactor: resumo do quadro usa SERVICE_STATUSES em vez de repetir os status
51fb13f refactor: contador das colunas do quadro vem do countByStatus
```

**O que mudou e por que o comportamento continua o mesmo:** As contagens iniciais passaram a ser geradas de `SERVICE_STATUSES` em vez de repetir os 4 nomes à mão. Assim, se um dia surgir um status novo, o resumo não esquece dele. O resultado para a mesma lista é idêntico, e o teste do cenário continua verde. Depois veio um segundo refactor, `51fb13f`: o contador de cada coluna do quadro passou a vir do `countByStatus`, em vez de um `filter(...).length` próprio. O número mostrado é o mesmo, conferido no navegador.

**Saída do terminal depois do refactor:**

```
> repairhub@0.0.0 test
> vitest run


 RUN  v5.0.5 /home/oziel/Documentos/Projetos/repairhub


 Test Files  1 passed (1)
      Tests  44 passed (44)
   Start at  15:41:48
   Duration  257ms (import 53%, tests 22%, transform 22%, worker 3%)
```

**Confirmação:** `npm test` rodado de novo depois do refactor: ainda verde?
`[x] sim` `[ ] não, e por isso eu desfiz`

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

O red `98124ad` aparece abaixo, ou seja, antes, do green `05372ee`. Para conferir que o
commit red só tem teste: `git show --stat 98124ad` lista apenas `tests/services.test.ts`.
