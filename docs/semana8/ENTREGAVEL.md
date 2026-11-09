# Semana 8 — Verificadores (entrega completa)

Aluno: Oziel Sousa · Projeto: RepairHub (domínio 7) · Repositório público.

## 1. CI bloqueando merge

- **Scripts** no `package.json`: `lint`, `typecheck` (`tsc -b`), `build`, `test` e `verify`, que roda os 4 em sequência.
- **Workflow** em `.github/workflows/ci.yml`, com 6 jobs: Lint, Type check, Build, Test,
  `npm audit --audit-level=high` e `dependency-review-action` (este só roda em PR). Entrou no PR #2.
- **Branch protection** com o ruleset `proteger-main` na branch padrão, ativo e **sem ninguém
  liberado para pular, nem o dono do repositório**:
  - exige PR antes do merge (0 aprovações, porque trabalho sozinho);
  - exige os 6 checks acima verdes;
  - bloqueia apagar a `main` e bloqueia force push.
- **Prova do bloqueio:** PR #3 (`teste/quebra-proposital`) com um teste quebrado de propósito.
  O job Test falhou ([execução](https://github.com/ozielrsdev/repairhub/actions/runs/42675670959))
  e o GitHub marcou o PR como `BLOCKED`. Print: [`merge-bloqueado.png`](merge-bloqueado.png).
  O PR foi fechado sem merge.
- **Dependency check:** na primeira execução o `dependency-review-action` falhou com
  "Dependency review is not supported on this repository". O "Dependency graph" estava
  desligado. Liguei os alertas de vulnerabilidade, rodei de novo e o job passou.

## 2 e 3. Os 3 cenários BDD e os ciclos red/green/refactor

Os cenários da Semana 6 ficaram no desafio `frontend-challenge`, e as regras atuais do
RepairHub já tinham teste. Escrevi 3 cenários novos no mesmo formato, para regras que o
RepairHub ainda não tinha, para que o teste falhasse antes do código de verdade.

Cada commit foi enviado separado para o PR, então o CI rodou em cada um. O red falha e o green passa:

| # | Cenário (= nome do teste) | Red (CI falhou) | Green (CI passou) | Refactor | Log |
|---|---|---|---|---|---|
| 1 | orçamento zero ou negativo não substitui o orçamento já registrado | [`d2e46a5`](https://github.com/ozielrsdev/repairhub/actions/runs/42676556583) | [`a2bef65`](https://github.com/ozielrsdev/repairhub/actions/runs/42677179821) | não houve | [LOG 1](LOG-RED-GREEN-REFACTOR-1.md) |
| 2 | serviço sem orçamento não vai para Em manutenção | [`89f55ef`](https://github.com/ozielrsdev/repairhub/actions/runs/42677237402) | [`37b7487`](https://github.com/ozielrsdev/repairhub/actions/runs/42677300840) | não houve (tela: `cfd065a`) | [LOG 2](LOG-RED-GREEN-REFACTOR-2.md) |
| 3 | resumo do quadro conta quantos serviços há em cada status | [`98124ad`](https://github.com/ozielrsdev/repairhub/actions/runs/42677410229) | [`05372ee`](https://github.com/ozielrsdev/repairhub/actions/runs/42677462720) | `af5cef6`, `51fb13f` | [LOG 3](LOG-RED-GREEN-REFACTOR-3.md) |

O cenário 2 mudou uma regra que já existia, e 4 testes antigos caíram. Acrescentei o
orçamento só no "Dado" deles, sem mudar o que verificam. Está explicado no LOG 2.

## 4. Teste que não prova nada

Padrão 3, cobertura alta sem valor: `expect(servico.id).toBeTruthy()` continuava verde com
todo serviço usando o mesmo id. Foi trocado por um teste que exige ids diferentes. A prova,
com a quebra de propósito e as saídas, está em [TESTE-QUE-NAO-PROVA-NADA.md](TESTE-QUE-NAO-PROVA-NADA.md).

## npm audit

Rodado localmente e no CI: **nenhuma vulnerabilidade high ou critical**, por isso o job passa.
Ficam 13 moderate e 2 low, que entram pelo `shadcn` (`deepmerge`, `minimatch`). A correção
sugerida (`npm audit fix --force`) rebaixaria o `shadcn` para a 1.0.0, uma mudança que
quebra o projeto. Fica registrada, sem bloquear, até sair uma versão corrigida.

## Para o dono do negócio

Hoje o RepairHub tem uma regra que protege a loja: nenhum computador entra em manutenção sem
orçamento registrado. Se alguém da equipe, ou um assistente de IA, apagar essa regra sem
querer ao mexer no sistema, a mudança não vai pro ar. Antes de publicar, o GitHub (onde o
código fica guardado) roda sozinho uma lista de checagens, e uma delas tenta mover um
serviço sem orçamento: se o sistema deixar, a publicação fica travada até alguém corrigir.
Isso não depende de ninguém lembrar de testar; a trava existe mesmo quando a pessoa está
com pressa ou quando a IA diz que "está tudo pronto".

## O sensor que mais vai me salvar

No RepairHub, o que mais vai me salvar são os testes. O sistema é feito de regras que
dependem umas das outras: diagnóstico antes da manutenção, orçamento antes da manutenção,
serviço realizado antes de concluir. Quando eu peço uma regra nova, a IA mexe no mesmo
código das antigas. Foi o que aconteceu nesta semana: ao criar a regra do orçamento, 4
testes antigos caíram na hora e me mostraram exatamente quais caminhos do quadro tinham
mudado. Lint, type check e build pegam erro de escrita; só o teste pega quando a regra do
negócio muda sem eu querer.
