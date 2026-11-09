# Checklist de sinais de código ruim gerado por IA

Artefato do curso. Nasce na semana 5, reusado sem reexplicar nas semanas 7
(Spec-Driven Development), 8 (Verificadores) e 9 (Code review e subagentes de revisão).
Se você está lendo isso numa semana futura: os nomes abaixo já são vocabulário conhecido
da turma — cite pelo nome, não redefina do zero.

**Como usar:** não é uma rubrica de "reprovado/aprovado". É uma lista de sinais que você
procura antes de aceitar um diff. Achar um sinal não significa reescrever tudo — significa
que você agora sabe *o que perguntar* pro agente antes do próximo commit.

**O que isso não é:** um linter. Nenhum sinal aqui é detectado 100% por ferramenta —
alguns o Sonar pega (duplicação, complexidade ciclomática), a maioria exige leitura humana
do diff. É por isso que o julgamento continua seu, mesmo com CI verde.

---

## Categoria 1 — Abstraction Bloat (o núcleo desta semana)

Abstraction Bloat é o nome que este curso dá pra um padrão específico: **o modelo cria
estrutura (classes, camadas, arquivos, interfaces) proporcional à sua incerteza sobre o
problema, não à complexidade real do problema.** Quanto menos claro o pedido, mais camada
genérica aparece — porque camada genérica "parece" cobrir mais casos, e o modelo não paga
o custo de manter aquilo depois. Ver `REFERENCIAS.md` #1–#4 para os dados que sustentam
que isso é padrão observado, não impressão.

### 1.1 — Classe Deus (`God Class`)

Um arquivo/classe que sabe fazer tudo sobre uma entidade: validar, formatar, persistir,
notificar, logar. Cresce porque cada novo pedido ("agora também precisa notificar por
e-mail") é mais barato de colar ali dentro do que de parar e perguntar "isso é
responsabilidade de outra coisa?".

```js
// sinal: um arquivo, cinco responsabilidades que não têm nada a ver entre si
class LeadManager {
  validate(lead) { /* ... */ }
  formatForDisplay(lead) { /* ... */ }
  saveToDatabase(lead) { /* ... */ }
  sendWelcomeEmail(lead) { /* ... */ }
  logActivity(lead) { /* ... */ }
  calculateLeadScore(lead) { /* ... */ }
}
```

**Por que o modelo produz isso:** o prompt raramente pede uma responsabilidade só ("crie
a função que valida o lead") — pede a feature inteira ("crie o fluxo de cadastro de
lead"). Sem alguém dizendo onde a fronteira fica, o caminho de menor resistência
estatístico é um arquivo só, porque é o que menos exige que o modelo infira uma decisão
de arquitetura que ninguém pediu explicitamente.

### 1.2 — Miragem Modular (`Modular Mirage`)

O oposto que parece o mesmo problema resolvido: arquivos separados, nomes de módulo
bonitos, **zero coesão semântica real** — é só o código de antes, cortado em pedaços, sem
que a separação signifique nada sobre o domínio.

```
src/
  leadService.js     // 40% do que devia estar em leadValidator.js
  leadValidator.js    // 30% do que devia estar em leadService.js
  leadHelper.js        // o resto, sem critério de onde ele deveria estar
```

**Por que o modelo produz isso:** quando você pede "separa isso em arquivos menores",
o modelo otimiza pra "arquivo menor" (uma métrica de linha de código), não pra "fronteira
que faz sentido pro domínio" — porque a segunda exige saber o domínio, e a primeira é
sintática.

### 1.3 — Camada de Passagem

Uma classe/função `Manager`, `Handler`, `Service`, `Processor` que só repassa a chamada
pra outra coisa, sem adicionar nenhuma regra, decisão ou transformação.

```js
// sinal: zero lógica própria — é um alias caro
class LeadHandler {
  handle(lead) {
    return this.leadService.process(lead);
  }
}
```

**Por que o modelo produz isso:** padrões de arquitetura enterprise (camada de service,
camada de handler, camada de repository) aparecem MUITO no material de treino como "boa
prática" — o modelo replica a forma do padrão mesmo quando o problema não tem escala pra
justificar a camada.

### 1.4 — Nomeação genérica como sintoma

`Manager`, `Handler`, `Processor`, `Util`, `Helper`, `Service`, `Data`. Nenhum desses
nomes vem do vocabulário do seu domínio — vêm do vocabulário de "como construir software
em geral". Isso é sinal, não estilo: **nome genérico geralmente significa que ninguém
decidiu a que domínio aquele código pertence.** É o ponto exato onde este checklist se
conecta com DDD estratégico (seção 2 da aula) — linguagem ubíqua é o antídoto direto pra
1.4.

---

## Categoria 2 — Duplicação em vez de reuso

```js
// arquivo A
if (!lead.email || !lead.email.includes('@')) throw new Error('email inválido');

// arquivo B, escrito 10 minutos depois pelo mesmo agente
if (!cliente.email || !cliente.email.includes('@')) throw new Error('email inválido');
```

**Por que o modelo produz isso:** o modelo não tem visão persistente do repositório
inteiro a cada turno — ele vê o que está na janela de contexto daquele momento. Se a
função equivalente não foi lida nessa sessão, reescrever é estatisticamente mais provável
que procurar. Dado publicado: duplicação de blocos subiu **81% entre 2023 e 2026**, e a
proporção duplicação:refatoração passou de 1:2 pra 5:1 no mesmo período (`REFERENCIAS.md` #2).

## Categoria 3 — Mascaramento de erro

```js
try {
  await enviarEmail(lead);
} catch (e) {
  // segue o baile
}
```

**Por que o modelo produz isso:** um `catch` vazio faz o código "funcionar" na primeira
tentativa — não quebra, não gera stack trace, parece pronto. O modelo otimiza pra "rodou
sem erro na demonstração", não pra "erro visível quando algo real dá errado depois".
Dado publicado: construtos que mascaram erro subiram **47%** no mesmo levantamento.

## Categoria 4 — API ou biblioteca alucinada

```js
const { validarCPF } = require('cpf-validator-brasil-pro'); // não existe no package.json,
// nunca foi instalado, o agente "lembrou" de um pacote que soa plausível.
```

Vocabulário já visto na aula 1 (alucinação). Aqui ele aparece disfarçado — o `require`
fica num caminho de código que os testes não exercitam, então passa despercebido até
alguém rodar aquele fluxo específico em produção.

## Categoria 5 — Defensividade sem necessidade (`Too Many Branches`)

```js
function calcularDesconto(valor) {
  if (valor === null) return 0;
  if (valor === undefined) return 0;
  if (typeof valor !== 'number') return 0;
  if (isNaN(valor)) return 0;
  if (valor < 0) return 0;
  // ... a regra de negócio de verdade só começa aqui
}
```

**Por que o modelo produz isso:** cada `if` de guarda parece "mais robusto" e custa pouco
pro modelo escrever — mas ramos que nunca são exercitados por nenhum teste nem por nenhum
caller real são complexidade paga por ninguém. O paper de `REFERENCIAS.md` #3 nomeia isso
de **"Reasoning-Complexity Paradox"**: quanto mais capaz o modelo, mais ele tenta cobrir
complexidade que a tarefa não tinha, e o método cresce em vez de simplificar.

## Categoria 6 — Fronteira dissolvida

Uma função que mistura vocabulário de dois domínios que deveriam ser dois bounded
contexts diferentes — ex.: uma função de "processar pagamento" que também decide regra de
"quando notificar o aluno". É o sinal mais difícil de ver sozinho, porque o código roda e
os testes passam; só aparece quando você tenta nomear a função com uma palavra do
domínio e nenhuma palavra serve, porque ela faz duas coisas de dois mundos diferentes.

---

## O que este checklist NÃO substitui

- Não substitui rodar os testes. Sinal aqui não é bug — é risco de manutenção.
- Não substitui o `DECISAO-ESCOPO.md` da semana 4 (o que uma tool NÃO pode fazer) — são
  perguntas diferentes: aquele é sobre raio de dano, este é sobre estrutura do código.
- Não é uma lista fechada. Se você achar um padrão que se repete no seu projeto e não
  está aqui, nomeie-o você mesmo — isso é literalmente o exercício de linguagem ubíqua
  da seção 2.

## Métrica quando você não tem tempo de ler tudo

Não existe uma métrica única e confiável de "Abstraction Bloat" publicada (se alguém te
vender uma, desconfie). O que existe, combinado, é sinal indireto forte:

1. **Razão duplicação : refatoração** no seu histórico de commits — se você duplica mais
   do que extrai, está acumulando bloat mesmo sem perceber.
2. **Linhas por método/arquivo crescendo sem o domínio ter crescido** — se a feature é a
   mesma de duas semanas atrás mas o arquivo dobrou, pergunte por quê.
3. **Nomes genéricos por arquivo** — conte quantos arquivos do seu `src/` têm `Manager`,
   `Handler`, `Service`, `Util` no nome. Não é proibido — é um contador de atenção.

Nenhuma dessas três é uma métrica de ferramenta automática neste curso. É observação
disciplinada, feita por você, toda vez que revisa um diff.
