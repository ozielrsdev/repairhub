---
name: nova-regra
description: Cria uma regra de negócio nova no RepairHub de ponta a ponta — confere conflito com as regras existentes, escreve o teste antes, implementa em src/services.ts, liga na tela com mensagem de erro e confere o fluxo completo. Use quando o usuário pedir uma regra nova, uma validação ou uma restrição sobre serviços, status, cadastro, diagnóstico ou serviço realizado.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(npm test:*), Bash(npm run build:*), Bash(npm run lint:*)
---

# Nova regra de negócio

## O que ela faz

Recebe uma regra de negócio em texto ("um serviço só pode X se Y") e entrega a regra
funcionando: teste, código em `src/services.ts`, mensagem de erro na tela e o caminho do
técnico ainda possível do começo ao fim.

## Quando dispara (e quando não)

- **Dispara:** "nova regra: o equipamento não pode ter mais de 50 caracteres", "só pode
  voltar de Concluído pra Em manutenção se tiver um motivo".
- **Não dispara:** "adicione uma regra no CLAUDE.md" (regra pro agente, não regra de
  negócio), "mude a cor da mensagem de erro", "corrija o bug do botão Salvar".

## Passos

1. **Conflito primeiro.** Leia `src/services.ts` e `tests/services.test.ts`. Se a regra nova
   contradiz uma existente, ou trava o fluxo cadastrar → avançar o status → registrar o
   serviço realizado → concluir, pare e mostre as opções ao usuário antes de escrever código.
2. **Campo na tela.** Se a regra depende de um dado que a tela não deixa preencher, o
   plano tem que incluir o campo. Regra que o usuário não consegue cumprir não é regra.
3. **Mostre o plano** e espere confirmação.
4. **Teste antes** (skill `tdd`): acrescente os testes, rode `npm test` e mostre que falham.
   Nunca altere um teste existente.
5. **Implemente** em `src/services.ts` até ficar verde.
6. **Ligue na tela:** handler no `App.tsx` pelo `updateService`, erro aparecendo no card ou no
   formulário com a classe `form-error`.
7. **Verifique:** `npm test`, `npm run build`, `npm run lint`, e o checklist do fluxo completo.

Para o formato das mensagens, um exemplo completo e o checklist da tela, veja
[reference.md](reference.md).

## Exemplo de invocação

```
/nova-regra um serviço só pode ir para "Em manutenção" se tiver um diagnóstico preenchido
```
