# Plano da plataforma para assistências técnicas

Resposta ao [`docs/visao-plataforma.md`](visao-plataforma.md), de 2026-11-10. As decisões
tomadas em 2026-11-11 estão logo abaixo e valem sobre o resto do texto, que ficou como
registro da proposta original. Os termos estão em [`GLOSSARY.md`](../GLOSSARY.md).

## Decisões (2026-11-11)

| Pergunta | Decisão |
|---|---|
| 1. Quem faz login? | **Só o dono.** Funcionários são só nomes para escolher o técnico responsável. |
| 2. O que cada papel pode fazer? | Não se aplica: só o dono entra. |
| 3. O cliente final acessa alguma coisa? | **Não, no teste.** A assistência registra a aprovação e por onde ela veio (presencial, telefone, WhatsApp). |
| 4. Orçamento recusado | **Devolvido sem conserto**, com taxa de diagnóstico opcional. |
| 5. Concluído e Entregue | **Etapas separadas.** Concluído = conserto pronto, esperando retirada. Entregue = cliente retirou e pagou. |
| 6. Pagamento | **Mais de uma forma na mesma OS**, com a soma fechando o total. Sinal na entrada fica para depois. |
| 7. Garantia | **Prazo padrão por assistência**, que dá para mudar em cada OS, com aviso se for menor que 90 dias. Retorno em garantia é uma OS nova ligada à anterior. |
| 8. Estoque de peças | **Fora.** A peça é só uma linha do orçamento. |
| 9. Quem testa primeiro e quanto gastar | **Em aberto.** |
| 10. Back-end | **Supabase** ([ADR 0001](adr/0001-supabase-como-back-end.md)), com um banco só separado por assistência ([ADR 0002](adr/0002-separacao-por-assistencia.md)). |

**Ordem das fases:** aprovada a da seção 4 (login e assistência antes de clientes). Com só o
dono entrando, a Fase 3 fica só com o cadastro de funcionários e o técnico responsável.

**Fluxo de status novo:**

```
Recebido → Em análise → Aguardando aprovação → Em manutenção → Concluído → Entregue
                               │
                               └─ recusado → Devolvido sem conserto (taxa opcional)
```

"Devolvido sem conserto" é um final e não ganha coluna no quadro; aparece nos filtros e no
histórico.

**Conflito com os testes de hoje (decidir na Fase 4):** o fluxo novo faz deixarem de passar
os testes `Concluído só pode voltar para Em manutenção`, `com diagnóstico e orçamento, avança
para Em manutenção`, `Em análise com diagnóstico e orçamento pode voltar ou ir para Em
manutenção` e o `fluxo completo`, em `tests/services.test.ts`. Esses testes só mudam com
aprovação explícita do dono do projeto, como mudança de especificação, reescritos antes do
código. O nome no código (`Service`) também muda para Ordem de Serviço aos poucos, nas fases.

**Nota fiscal:** continua fora do escopo.

**Exceção da Fase 1:** as mudanças de status ainda não são garantidas no banco, só no
`src/services.ts`. Entram no banco na Fase 4, quando o fluxo de status muda, para não
escrever as mesmas regras duas vezes. O risco enquanto isso é baixo: com o Row Level
Security e só o dono entrando, quem pular uma etapa só mexe nos próprios dados. A separação
por assistência e as checagens de status, urgência e orçamento já estão no banco.

**Antes de vender: reserva de CNPJ.** O cadastro é aberto, e o banco confere só se o CNPJ
é válido, não se a pessoa é dona da empresa. Alguém pode criar uma conta com o CNPJ de outra
assistência e impedir a dona verdadeira de se cadastrar (o CNPJ só pode ter uma conta).
Opções a decidir: aprovação manual das contas novas, conferir o CNPJ e o e-mail numa base
pública, ou um jeito de a dona verdadeira contestar. Achado da revisão de segurança da
Fase 1.

---

## 1. Perguntas antes de começar

As mais importantes vêm primeiro.

1. **Quem faz login?** Cada funcionário tem login próprio, ou só o dono entra e os
   funcionários são só nomes para escolher o técnico? Login por funcionário dá para saber
   quem fez cada etapa, mas exige convite, papéis e permissões.
2. **O que cada papel pode fazer?** Por exemplo: o técnico vê os valores? Quem pode dar
   desconto? Quem registra a aprovação do orçamento?
3. **O cliente final acessa alguma coisa?** Ele pode receber um link para ver e aprovar o
   orçamento, ou a assistência registra a aprovação depois de falar com ele por telefone ou
   WhatsApp?
4. **O que acontece quando o orçamento é recusado?** O equipamento volta sem conserto? A
   assistência cobra uma taxa de diagnóstico? Isso cria um caminho novo no fluxo.
5. **"Concluído" e "Entregue" são a mesma coisa?** Normalmente o conserto termina num dia e
   o cliente retira e paga dias depois. Hoje o sistema para em Concluído.
6. **Como é o pagamento?** Pode ter sinal na entrada, pagar com mais de uma forma no mesmo
   serviço (parte Pix, parte cartão) ou pagar parcial?
7. **Como é a garantia?** É um prazo padrão por assistência? E quando o equipamento volta na
   garantia: é um serviço novo ligado ao anterior?
8. **Precisa de estoque de peças?** Recomendo deixar fora: no orçamento, a peça seria só uma
   linha com descrição e valor.
9. **Quem testa primeiro?** Tem uma assistência real disposta a testar? Quanto você pode
   gastar por mês durante o teste, mesmo que seja zero?
10. **Como você quer trabalhar no back-end?** Quer aprender a montar um back-end próprio, ou
    prefere um serviço pronto e foco no produto? Isso decide a seção 3.

---

## 2. Modelo de domínio

### Termos que precisam ficar precisos

| Hoje | Problema | Proposta |
|---|---|---|
| "Serviço" | Hoje a mesma palavra quer dizer três coisas: o atendimento inteiro, o "serviço realizado" e uma linha de mão de obra no orçamento. | **Ordem de Serviço (OS)** para o atendimento inteiro. **Serviço realizado** continua sendo o texto do que foi feito. **Item de mão de obra** para a linha do orçamento. |
| "Cliente" | Pode ser o cliente da assistência ou a própria assistência, que é cliente da plataforma. | **Assistência** para a empresa que usa o sistema. **Cliente** só para a pessoa ou empresa que traz o equipamento. |
| "Funcionário" | Fica a dúvida se é quem faz login ou quem aparece como técnico. | **Funcionário** é quem trabalha na assistência. Se ele tem login (pergunta 1), isso é uma propriedade do funcionário, não outra entidade. |
| "Orçamento" | Hoje é um número só (`budget` em `src/types.ts`). | **Orçamento** com itens, desconto e total, e com a aprovação ou recusa do cliente. |
| "Nota fiscal" | Nesta fase não existe. | **Comprovante de serviço**, o PDF que avisa que não tem valor fiscal. A palavra "nota" fica reservada para a nota fiscal oficial no futuro. |

### Entidades

```
Assistência ──< Funcionário
     │
     ├──< Cliente ──< Equipamento
     │                    │
     └──< Ordem de Serviço >┘ (uma OS = um equipamento de um cliente)
              │  técnico responsável → Funcionário
              ├──< Etapa (histórico: status, quem mudou, quando)
              ├──< Orçamento (versões) ──< Item (mão de obra | peça)
              ├──< Pagamento (forma, valor, parcelas)
              └──< Comprovante (PDF emitido, com os dados congelados)
```

| Entidade | Campos principais |
|---|---|
| **Assistência** | nome fantasia, razão social, CNPJ, endereço, telefone, e-mail, logo, garantia padrão |
| **Funcionário** | nome, cargo, contato, papel (dono, atendente, técnico), ativo ou inativo |
| **Cliente** | tipo (pessoa física ou jurídica), nome, CPF ou CNPJ, telefone, e-mail, endereço |
| **Equipamento** | tipo, marca, modelo, número de série |
| **Ordem de Serviço** | número sequencial por assistência (OS 0001), problema relatado, acessórios entregues, estado em que chegou, urgência, diagnóstico, serviço realizado, status, técnico, garantia |
| **Orçamento** | versão, itens, desconto, total, situação (aguardando, aprovado, recusado), data e meio da aprovação |
| **Item** | tipo (mão de obra ou peça), descrição, quantidade, valor unitário |
| **Pagamento** | forma (dinheiro, Pix, débito, crédito, boleto), valor, parcelas, data |
| **Comprovante** | tipo (orçamento ou fechamento), data de emissão, cópia dos dados daquele momento |

### Cenários que testam o modelo

- **O cliente traz o notebook e o carregador.** É uma OS só, com o carregador como acessório
  entregue. Se ele trouxer dois notebooks, são duas OS.
- **O técnico abre o equipamento e acha mais uma peça com defeito, depois da aprovação.**
  Proposta: o sistema cria uma nova versão do orçamento, que precisa de nova aprovação. A
  versão aprovada antes continua guardada. É isso que dá transparência.
- **O cliente muda de endereço depois de pegar o comprovante.** Se o PDF for refeito com o
  endereço novo, ele deixa de bater com o que o cliente tem em mãos. Por isso o comprovante
  guarda uma cópia dos dados do dia em que foi emitido. O mesmo vale se a assistência trocar
  o logo.
- **Um funcionário é demitido.** As OS antigas continuam mostrando o nome dele. Ele fica
  inativo em vez de ser apagado.
- **Uma assistência tenta abrir a OS de outra pelo endereço da página.** O sistema tem que
  negar. Isso vira um teste automático.

### Conflitos com o código de hoje

- **Status:** `changeStatus` deixa Concluído voltar para Em manutenção. Com pagamento e
  comprovante emitidos, voltar o status desfaz um documento já entregue ao cliente. Isso vai
  conflitar com a regra atual, e precisa de decisão.
- **Cliente e orçamento:** o `client` hoje é um texto solto, e `budget` é um número. Os dois
  viram entidades próprias. Os testes atuais continuam valendo como especificação das regras
  de status e diagnóstico, mas os dados vão mudar de formato.

O glossário só vai para o `GLOSSARY.md` depois que esses termos forem confirmados.

---

## 3. Arquitetura

### Back-end, banco e autenticação

| Opção | Prós | Contras | Custo |
|---|---|---|---|
| **A. Supabase** (Postgres + Auth + Storage) | Login pronto e senhas guardadas por ele. A separação entre assistências fica no próprio banco (Row Level Security). É Postgres, então dá pra sair dele depois. Pouco código de servidor. | É um serviço de terceiro. As regras que hoje ficam no `services.ts` precisam ser protegidas também no banco. | Plano grátis para o teste. O projeto grátis é pausado depois de uma semana sem uso. O pago fica em torno de US$ 25/mês (conferir o preço atual). |
| B. Firebase | Também tem login pronto. | É banco de documentos, ruim para relações como Cliente → Equipamento → OS → Orçamento. | Grátis no começo, mas o custo cresce com o número de leituras. |
| C. Back-end próprio (Node + Postgres + biblioteca de autenticação) | Controle total, e mais aprendizado. | Muito mais trabalho, e a segurança do login fica por conta própria. | Hospedagem do servidor e do banco, também com planos grátis limitados. |

**Recomendação: opção A (Supabase).** Ela resolve as três partes mais arriscadas: login,
senhas e separação entre assistências. Ela só não vale se a resposta à pergunta 10 for
"quero aprender back-end".

Um ponto muda uma regra do CLAUDE.md. Hoje as regras de negócio só rodam no navegador. Com um
banco na internet, qualquer pessoa pode chamar o banco direto e passar por cima da tela. Por
isso:
- as regras continuam em `src/services.ts`, puras e testadas;
- as regras críticas são garantidas também no banco: a separação por assistência, as
  mudanças de status e não poder apagar uma OS com comprovante emitido.

### Separação entre assistências

Proposta: um banco só, com um campo de assistência em toda tabela e Row Level Security. A
alternativa, um banco ou esquema por assistência, é exagero nesta escala. Essa é uma decisão
difícil de desfazer, então vale um ADR.

### Geração de PDF

| Opção | Prós | Contras |
|---|---|---|
| **A. `@react-pdf/renderer` no navegador** | Layout controlado e o mesmo arquivo em qualquer navegador. Não precisa de servidor e não tem custo. | É uma dependência nova (precisa de aprovação) e deixa o app mais pesado. |
| B. Página de impressão (`window.print` com CSS de impressão) | Nenhuma dependência. | O resultado muda de navegador para navegador, e o usuário precisa escolher "Salvar como PDF". |
| C. PDF gerado no servidor | Dá pra gerar automaticamente e enviar por e-mail. | Precisa de servidor, é pesado e custa mais. |

**Recomendação: opção A.** Sem nenhuma dependência agora, a opção B serve para o primeiro
teste.

### Deixar a porta aberta para a nota fiscal

Para a nota oficial poder entrar depois sem refazer nada, três coisas já ficam prontas no
modelo:
- os itens do orçamento separados entre mão de obra e peça, porque a NFS-e cobre serviço e
  a NF-e cobre peça;
- o CPF ou CNPJ do cliente guardado no cadastro;
- o comprovante como uma entidade própria, à qual a nota pode se ligar depois.

### Dependências que vão exigir aprovação

- `@supabase/supabase-js`, para falar com o banco e o login;
- `@react-pdf/renderer`, se a opção A do PDF for escolhida;
- provavelmente um roteador de páginas, como o `react-router`, quando o app ganhar telas de
  login, clientes e OS.

Nenhuma é instalada antes da aprovação.

---

## 4. Plano em fases

A ordem é diferente da que está no `visao-plataforma.md`. **Login e assistência vêm antes
do cadastro de clientes**, porque a separação entre assistências depende de saber quem está
logado. Salvar clientes sem login e adaptar tudo depois daria retrabalho.

| Fase | Entrega usável | Fluxo que fecha a fase |
|---|---|---|
| **0. Decisões** | Respostas às perguntas, `GLOSSARY.md`, ADRs (Supabase e separação entre assistências), CLAUDE.md atualizado | — |
| **1. Conta e dados salvos** | Criar a conta da assistência (com CNPJ validado), login, e o quadro de OS atual salvo no banco, com cada assistência vendo só as suas | criar conta → entrar → cadastrar OS → recarregar a página e a OS continua lá |
| **2. Clientes e equipamentos** | Cadastro e busca de clientes, cliente ligado à OS, histórico por cliente | abrir OS → buscar ou cadastrar cliente → ver o histórico do cliente |
| **3. Funcionários** | Cadastro de funcionários e técnico responsável na OS (só o dono entra no sistema) | cadastrar técnico → atribuir à OS → ver o técnico na OS e no comprovante |
| **4. Orçamento** | Itens, desconto, versões, aprovação ou recusa, PDF do orçamento | diagnóstico → orçamento → PDF → registrar aprovação → Em manutenção |
| **5. Fechamento** | Pagamento, garantia, entrega, PDF final com "Este documento não tem valor fiscal" | concluir → registrar pagamento → emitir comprovante → entregar |

**O teste com uma assistência real** pode começar no fim da Fase 4, que já entrega o
primeiro PDF. A Fase 5 completa o comprovante final.

---

## 5. O que muda no CLAUDE.md e no README

**CLAUDE.md:**
- **Descrição:** passa de "um comércio organiza os próprios equipamentos" para "plataforma
  para assistências técnicas".
- **Stack:** entram Supabase, a biblioteca de PDF e o arquivo `.env.local`, com o aviso de
  que a chave secreta do Supabase nunca vai para o front-end.
- **Regra de negócio:** passa a ser "em `src/services.ts` e, se for crítica, garantida
  também no banco".
- **Regra nova:** toda tabela nova tem separação por assistência e um teste mostrando que
  outra assistência não lê os dados.
- **Fluxo completo a testar:** passa a ser login → abrir OS com cliente → diagnóstico →
  orçamento → aprovar → manutenção → concluir → pagamento → comprovante.
- **Dados pessoais:** CPF, telefone e endereço nunca aparecem em log ou mensagem de erro.

**README:** a reescrita é quase completa: problema, público, o que funciona, regras, como
rodar (incluindo configurar o Supabase) e estrutura. A busca por cliente entra nessa
reescrita.

---

## 6. Impacto legal e de segurança

- **LGPD:**
  - A assistência é a dona dos dados dos clientes dela (controladora). A plataforma trata
    os dados em nome dela (operadora).
  - Por isso vão ser precisos termos de uso e uma política de privacidade antes de vender,
    e um jeito de exportar e apagar os dados de um cliente quando ele pedir.
  - Vale guardar só o necessário: o CPF pode ser opcional até a nota fiscal entrar.
- **Senhas:** ficam com o Supabase Auth. A plataforma nunca guarda senha.
- **Separação entre assistências:** é o risco mais grave do produto. Vazar dados de uma
  assistência para outra derruba a confiança no produto inteiro. Por isso a proteção fica
  no banco (Row Level Security), com um teste automático para cada tabela.
- **Código de Defesa do Consumidor:** a garantia legal mínima para serviço em bem durável é
  de 90 dias. A garantia padrão da assistência não pode ser menor que isso, e vale o sistema
  avisar. Orçamento por escrito, com itens, aprovado antes do conserto, também protege a
  assistência numa reclamação.
- **Comprovante:** o aviso "Este documento não tem valor fiscal" evita que ele seja
  confundido com nota fiscal.

---

## Próximo passo

Responder às perguntas da seção 1 (pelo menos a 1, a 4, a 5 e a 10) e dizer se o Supabase e
a nova ordem das fases estão aprovados. Depois disso entram o `GLOSSARY.md` e os ADRs.
