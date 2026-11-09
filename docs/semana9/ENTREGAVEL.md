# Semana 9 — Code review e subagentes de revisão (entrega completa)

Aluno: Oziel Sousa · Projeto: RepairHub · PR revisado: https://github.com/ozielrsdev/repairhub/pull/6

## 1. Subagentes configurados

`.claude/agents/revisor-sinais-ia.md` e `.claude/agents/revisor-seguranca-ia.md`, copiados de
`aula17-code-review-subagentes/starter/agentes-revisao/`, e `checklist-sinais-codigo-ia.md` na
raiz (cópia de `aula9-engenharia-para-ia/starter/`). Entraram no PR #5.

## 2. Revisão do PR #6 ("buscar serviços pelo nome do cliente", escrito pelo agente)

| arquivo | o que é |
|---|---|
| [REGISTRO-REVISAO-HUMANA.md](REGISTRO-REVISAO-HUMANA.md) | a minha revisão, commitada antes de qualquer subagente |
| [REGISTRO-SUBAGENTE.md](REGISTRO-SUBAGENTE.md) | a saída dos dois subagentes, sem edição |
| [REGISTRO-COMPARACAO.csv](REGISTRO-COMPARACAO.csv) | todos os achados juntos, com a prioridade final |

**Ordem provada:**

```
$ git log --format='%h %ad %s' --date=format:'%H:%M:%S' main..revisao/semana9
3130ee7 16:38:03 docs: saída dos subagentes revisor-sinais-ia e revisor-seguranca-ia no PR #6
b98b075 16:37:08 docs: revisão humana do PR #6 (semana 9), antes dos subagentes
```

**O que a comparação mostrou:** nenhum achado se repetiu entre mim e os subagentes.
- **Só eu achei (H1 a H4):** problemas de uso do quadro e uma regra de negócio, a de voltar o
  status no máximo até Em análise. Os subagentes leem o diff; eles não usam a tela e não
  conhecem a rotina da loja.
- **Só o `revisor-sinais-ia` achou (S1 e S2):**
  - S1, a regra de busca vazia repetida na tela: marquei como **bloqueia** e corrigi no
    próprio PR #6 (commit `611f5d0`).
  - S2, o contador que acompanha a busca: é intencional, não bloqueia.
- **`revisor-seguranca-ia`:** nenhum achado. O PR não envia nada para modelo, não executa
  texto, não mexe em MCP e não instala pacote.

## Para o dono do negócio

Antes de qualquer mudança no RepairHub ir pro ar, agora dois assistentes automáticos leem o
código: um procura jeitos de programar que costumam dar problema mais tarde, o outro procura
brechas de segurança conhecidas. Eles ajudam, porque não cansam e não esquecem de olhar. Mas
eles só leem o código, não usam a tela: não sentem que voltar um serviço etapa por etapa, ou
procurar o botão de fechar o card, cansa o técnico no meio do atendimento. Também não sabem
regras que só quem trabalha na loja conhece, como a de que um equipamento que já foi analisado
não precisa voltar para "Recebido". Por isso uma pessoa que conhece a loja continua revisando
antes de publicar.

## Qual subagente vai me poupar mais tempo

O robô que mais vai me poupar tempo no RepairHub é o de sinais de código ruim. Nesta revisão
ele achou uma regra da busca repetida dentro da tela, que eu não tinha visto e decidi corrigir
antes do merge. O de segurança não achou nada, porque hoje o RepairHub não tem IA dentro, nem
login, nem pacote novo; ele vai importar mais quando isso mudar. Na descrição do robô de sinais
eu mudaria duas coisas: pedir atenção redobrada sempre que o PR mexer em `src/services.ts`, onde
ficam as regras de status, orçamento e diagnóstico, e avisar sempre que uma regra da loja
aparecer copiada dentro da tela em vez de ficar só em `services.ts`.
