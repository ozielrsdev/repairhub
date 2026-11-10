# Nova visão do RepairHub: plataforma para assistências técnicas

## Contexto
O RepairHub hoje é um quadro Kanban de serviços de manutenção (React 19 + TypeScript + Vite,
Zod, Vitest), com as regras de negócio em `src/services.ts` e os dados só em memória.
Quero transformá-lo numa plataforma que eu vou VENDER para assistências técnicas usarem
(SaaS com várias empresas, cada uma vendo só os próprios dados).

## O que a plataforma precisa fazer

1. **Conta da assistência (empresa)**
   - Cadastro da assistência: nome fantasia, razão social, CNPJ (validado), endereço,
     telefone, e-mail, logo, inscrição municipal, regime tributário.
   - Login com e-mail e senha; recuperação de senha.
   - Cada assistência só enxerga os próprios clientes, serviços e documentos.

2. **Funcionários**
   - A assistência cadastra os funcionários (nome, cargo, contato) e o que cada um pode
     fazer: por exemplo, dono/administrador, atendente, técnico.
   - Cada serviço tem um técnico responsável, e dá pra ver quem fez cada etapa.

3. **Clientes**
   - Cadastro de cliente (pessoa física ou jurídica): nome, CPF ou CNPJ, telefone, e-mail,
     endereço.
   - Ao abrir um serviço novo, buscar um cliente existente ou cadastrar na hora.
   - Histórico de serviços por cliente e por equipamento.

4. **Serviços (ordem de serviço)**
   - Manter o fluxo e as regras que já existem: Recebido → Em análise → Em manutenção →
     Concluído, com diagnóstico, orçamento, serviço realizado e urgência.
   - Acrescentar: equipamento (marca, modelo, número de série, acessórios e estado em que
     chegou), técnico responsável, datas de cada etapa, e o cliente aprovando ou recusando
     o orçamento.

5. **Orçamento**
   - Itens de mão de obra e peças (descrição, quantidade, valor unitário), desconto e total.
   - Gerar o PDF do orçamento para enviar ao cliente.

6. **Fechamento e documentos**
   - Ao concluir: registrar o valor final, a forma de pagamento (dinheiro, Pix, cartão
     de débito ou crédito com parcelas, boleto) e a garantia.
   - Gerar um PDF claro e completo: dados da assistência, dados do cliente, equipamento,
     problema relatado, diagnóstico, o que foi feito, peças, valores, forma de pagamento,
     garantia, técnico responsável e datas.
   - Emitir a nota fiscal oficial (NFS-e para serviço, NF-e para peças) por um provedor de
     API de notas fiscais, usando os dados fiscais da assistência.

7. **Transparência para o cliente**
   - Tudo o que o cliente paga tem que estar explicado no documento: cada item, cada valor
     e o que foi feito, em linguagem que o cliente entende.

## Como eu quero que você trabalhe

- **Não escreva código agora.** Primeiro me entregue:
  1. As perguntas que você precisa que eu responda antes de começar.
  2. O modelo de domínio: entidades, campos e relações (Assistência, Funcionário,
     Cliente, Equipamento, Serviço, Orçamento, Item, Pagamento, Documento) e um glossário
     (skill `domain-modeling`).
  3. Uma proposta de arquitetura: back-end, banco, autenticação, separação entre
     assistências, geração de PDF e emissão de nota. Para cada escolha, as opções, os prós
     e contras e o custo, e qual você recomenda.
  4. Um plano em fases pequenas, cada uma entregando algo usável, por exemplo:
     - Fase 1: persistência e cadastro de clientes;
     - Fase 2: login, assistência e funcionários;
     - Fase 3: orçamento com itens e PDF;
     - Fase 4: fechamento, pagamento e PDF final;
     - Fase 5: nota fiscal oficial.
  5. O que muda no CLAUDE.md e no README com essa nova visão.
- Siga as regras do CLAUDE.md:
  - Não instale nenhuma dependência sem me perguntar.
  - Regra de negócio nova vai em `src/services.ts` (ou onde a arquitetura definir), com
    teste antes (skill `tdd`).
  - Nunca edite teste existente para ele passar.
  - Mensagens de erro em português, para quem usa o sistema.
- Se algo do que eu pedi entrar em conflito com uma regra que já existe, me avise e me dê
  as opções antes.
- Me aponte o que tem impacto legal ou de segurança:
  - LGPD: CPF e endereço de clientes;
  - guarda de senhas e do certificado digital;
  - os dados de uma assistência nunca podem aparecer para outra;
  - as exigências fiscais da nota.
