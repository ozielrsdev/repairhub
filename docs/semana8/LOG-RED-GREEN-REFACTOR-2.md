# LOG-RED-GREEN-REFACTOR-2 — Oziel Sousa / serviço sem orçamento não vai para Em manutenção

> Os cenários BDD da Semana 6 foram escritos no desafio `frontend-challenge`, outro projeto.
> Como as regras atuais do RepairHub já tinham teste, não daria para mostrar um teste
> falhando antes do código. Por isso escrevi 3 cenários novos, no mesmo formato
> Dado/Quando/Então, para regras que o RepairHub ainda não tinha. O cenário está no
> próprio arquivo de teste, em comentário acima do `describe`.

## Cenário

```gherkin
Cenário: serviço sem orçamento não vai para Em manutenção
  Dado um serviço Em análise com diagnóstico "Fonte queimada" e sem orçamento
  Quando tento colocar o serviço Em manutenção
  Então aparece o erro "Registre o orçamento antes de colocar o serviço Em manutenção"
```

## RED — o teste que ainda não passa

**Commit do teste (só o teste, nada de `src/`):**

```
89f55ef test: red — serviço sem orçamento não vai para Em manutenção (falha, esperado)
```

**Saída do terminal rodando o teste:**

```
> repairhub@0.0.0 test
> vitest run


 RUN  v5.0.5 /home/oziel/Documentos/Projetos/repairhub

 ❯ tests/services.test.ts (43 tests | 1 failed) 26ms
   ❯ orçamento antes de Em manutenção (1)
     × serviço sem orçamento não vai para Em manutenção 6ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/services.test.ts > orçamento antes de Em manutenção > serviço sem orçamento não vai para Em manutenção
AssertionError: expected [Function] to throw an error

- Expected:
null

+ Received:
undefined

 ❯ tests/services.test.ts:311:58
    309|
    310|     // Quando / Então
    311|     expect(() => changeStatus(servico, 'Em manutenção')).toThrow(
       |                                                          ^
    312|       'Registre o orçamento antes de colocar o serviço Em manutenção',
    313|     )

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 42 passed (43)
   Start at  15:39:40
   Duration  309ms (import 52%, transform 29%, tests 15%, worker 3%)
```

**Por que esperávamos que falhasse assim:** O campo `budget` já existia (cenário 1), mas o `changeStatus` só exigia o diagnóstico para ir para Em manutenção. O teste falha exatamente na regra: o serviço passa sem erro (`expected [Function] to throw an error`).

## GREEN — o menor código que faz passar

**Commit da implementação:**

```
37b7487 feat: green — serviço sem orçamento não vai para Em manutenção (teste passa)
```

**Saída do terminal com o teste passando:**

```
> repairhub@0.0.0 test
> vitest run


 RUN  v5.0.5 /home/oziel/Documentos/Projetos/repairhub


 Test Files  1 passed (1)
      Tests  43 passed (43)
   Start at  15:40:00
   Duration  285ms (import 63%, transform 24%, tests 10%, worker 2%)
```

**O que eu implementei e por que é o mínimo:** Uma checagem a mais no `changeStatus`: indo para Em manutenção com `budget === null`, dá erro. São 3 linhas.

### Testes antigos que a regra nova quebrou

Ao implementar a trava, 4 testes antigos caíram, porque levavam o serviço para Em manutenção só com diagnóstico. A saída foi esta:

```
     × com diagnóstico, avança para Em manutenção 5ms
     × fluxo completo: cadastrar → Em análise → diagnóstico → Em manutenção → serviço realizado → Concluído 1ms
     × Em análise com diagnóstico pode voltar ou ir para Em manutenção 4ms
     × Concluído só pode voltar para Em manutenção 1ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯
      Tests  4 failed | 39 passed (43)
```

O `CLAUDE.md` do projeto diz "nunca edite um teste pra fazê-lo passar". Aqui a regra do negócio mudou de propósito: agora o orçamento é exigido. Decidi acrescentar o orçamento só no "Dado" desses 4 testes, sem mudar o que cada um verifica. Nos dois em que o nome descrevia a preparação, o nome ganhou "e orçamento". Isso está no mesmo commit do green, com a explicação na mensagem.

## REFACTOR — o que eu limpei (se houve)

**O que mudou:** Não houve refactor de código. Depois do green veio um commit de tela (`cfd065a feat: campo de orçamento no card do quadro`). Sem ele, a regra nova travaria todo serviço em Em análise no app. Testei o fluxo completo no navegador: cadastrar → Em análise → diagnóstico → tentar Em manutenção (erro do orçamento) → orçamento -50 (erro) → orçamento 150 → Em manutenção → serviço realizado → Concluído.

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

O red `89f55ef` aparece abaixo, ou seja, antes, do green `37b7487`. Para conferir que o
commit red só tem teste: `git show --stat 89f55ef` lista apenas `tests/services.test.ts`.
