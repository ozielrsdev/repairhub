# Referência — nova-regra

## Mensagens de erro

- Em português, pra quem usa o sistema, não pra quem programa.
- Dizem o que fazer, não só o que deu errado: "Preencha o diagnóstico antes de colocar o
  serviço Em manutenção", não "Diagnóstico inválido".
- A regra lança `new Error(mensagem)` em `src/services.ts`. Quem mostra é a tela: o
  `updateService` do `App.tsx` captura e devolve a mensagem pro componente.
- Campo obrigatório no cadastro vira regra no schema do Zod (`newServiceSchema`), com a
  mensagem no `{ message: '...' }`.

## Onde cada coisa fica

| o quê | onde |
|---|---|
| tipo do serviço (campo novo) | `src/types.ts` |
| regra e validação | `src/services.ts` |
| testes | `tests/services.test.ts`, num `describe` novo com o nome da regra |
| estado e handlers | `src/App.tsx`, sempre pelo `updateService` |
| campo e erro na tela | `src/components/ServiceForm.tsx` (cadastro) ou `ServiceList.tsx` (card) |

## Testes que toda regra nova precisa

1. O caso que **funciona** (com exemplo real do domínio, não "teste123").
2. O caso que **dá erro**, conferindo o texto da mensagem.
3. Texto **só com espaços** conta como vazio, se a regra fala de campo preenchido.
4. Um teste que **não deixa a regra ser contornada** (ex.: apagar o campo depois que o
   status já passou do ponto que exigia ele).
5. O **fluxo completo** nas regras, do cadastro ao Concluído, ainda funciona.

## Checklist do fluxo completo na tela

Antes de dizer que terminou, descreva ao usuário o caminho que ele deve testar no
navegador (`npm run dev`), e confira no código que cada passo é possível:

- [ ] cadastrar um serviço
- [ ] avançar o status passo a passo até Em manutenção
- [ ] preencher todo campo que a regra nova exige — **existe um lugar na tela pra isso?**
- [ ] registrar o serviço realizado e concluir
- [ ] provocar o erro da regra nova e ver a mensagem aparecer

## Exemplo completo — diagnóstico antes de Em manutenção

Pedido: "um serviço só pode ir para Em manutenção se tiver um diagnóstico preenchido".

Conflito encontrado: não existe campo de diagnóstico. Usar o "serviço realizado" como
diagnóstico conflita com a regra que conclui o serviço ao salvar o serviço realizado em Em
manutenção. Opções mostradas: campo novo `diagnosis` (recomendado) ou reaproveitar o
`serviceDone`.

Plano:

- `types.ts`: `diagnosis: string` no `Service`
- `services.ts`: `diagnosis` opcional no cadastro (`.default('')`); `changeStatus` recusa
  entrar em Em manutenção sem diagnóstico; nova `updateDiagnosis`
- testes novos: erro sem diagnóstico; espaços contam como vazio; avança com diagnóstico;
  `updateDiagnosis` não muda o status; não apaga diagnóstico de serviço Em manutenção ou
  Concluído; fluxo completo cadastrar → Em análise → diagnóstico → Em manutenção →
  serviço realizado → Concluído
- tela: campo "Diagnóstico" com botão Salvar no card, igual ao do serviço realizado

## Casos-limite já vistos

- **Regra sem campo na tela.** A regra "só conclui com serviço realizado" foi criada com
  testes passando, mas a tela não deixava escrever o serviço realizado depois do cadastro:
  todo serviço travava. Por isso o passo 2 e o checklist existem.
- **Pedido vago que vira decisão do agente.** Se o pedido não diz o que acontece num caso
  (ex.: o status pode voltar?), pergunte em vez de decidir.
