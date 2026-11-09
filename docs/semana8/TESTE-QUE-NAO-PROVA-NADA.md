# Teste que não prova nada — o id do serviço

## Padrão

**3. Cobertura alta sem valor** (de `aula15-verificadores/starter/teste-que-nao-prova-nada-exemplos.md`).
O assert só confirmava que o id "existe", sem nenhum valor esperado.

## O teste original

```ts
test('cria o serviço com cliente e equipamento, sempre em Recebido', () => {
  const servico = createService(novoServico)

  expect(servico.client).toBe('Padaria Pão Quente')
  expect(servico.equipment).toBe('Computador do caixa')
  expect(servico.status).toBe('Recebido')
  expect(servico.id).toBeTruthy()
})
```

`toBeTruthy()` aceita qualquer texto que não seja vazio. Já o quadro depende de cada
serviço ter um id **diferente**: o card é achado pelo id para arrastar, salvar o
diagnóstico, o orçamento e o serviço realizado. Com ids repetidos, mexer num card mexeria
no card errado.

## A prova de que ele não detectava a quebra

Quebrei o `createService` de propósito, trocando `id: crypto.randomUUID()` por
`id: 'sempre-o-mesmo-id'`, e rodei o teste:

```
$ npx vitest run -t "cria o serviço com cliente"
RUN  v5.0.5 /home/oziel/Documentos/Projetos/repairhub


 Test Files  1 passed (1)
      Tests  1 passed | 43 skipped (44)
   Start at  15:42:21
   Duration  234ms (import 60%, transform 30%, tests 6%, worker 4%)
```

Ficou verde com todo serviço usando o mesmo id.

## A correção

O `toBeTruthy` saiu e entrou um teste que compara dois cadastros:

```ts
test('cada serviço cadastrado ganha um id diferente', () => {
  const primeiro = createService(novoServico)
  const segundo = createService(novoServico)

  expect(primeiro.id).not.toBe(segundo.id)
})
```

Com a mesma quebra ainda no código, o teste novo falha:

```
$ npx vitest run -t "cada serviço cadastrado|cria o serviço com cliente"
RUN  v5.0.5 /home/oziel/Documentos/Projetos/repairhub

 ❯ tests/services.test.ts (45 tests | 1 failed | 43 skipped) 11ms
   ❯ a) cadastro (7)
     × cada serviço cadastrado ganha um id diferente 5ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/services.test.ts > a) cadastro > cada serviço cadastrado ganha um id diferente
AssertionError: expected 'sempre-o-mesmo-id' not to be 'sempre-o-mesmo-id' // Object.is equality
 ❯ tests/services.test.ts:39:29
     37|     const segundo = createService(novoServico)
     38|
     39|     expect(primeiro.id).not.toBe(segundo.id)
       |                             ^
     40|   })
     41|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 1 passed | 43 skipped (45)
   Start at  15:42:22
   Duration  243ms (import 57%, transform 32%, tests 8%, worker 3%)
```

Desfiz a quebra (`git checkout src/services.ts`) e a suíte inteira voltou a passar:

```
> repairhub@0.0.0 test
> vitest run


 RUN  v5.0.5 /home/oziel/Documentos/Projetos/repairhub


 Test Files  1 passed (1)
      Tests  45 passed (45)
   Start at  15:42:23
   Duration  205ms (import 69%, tests 17%, transform 10%, worker 4%)
```

Commit: `0dfb07e test: troca o toBeTruthy do id por um teste que exige ids diferentes`.
A quebra de propósito nunca foi commitada.
