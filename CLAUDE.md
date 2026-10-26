# RepairHub

Sistema para pequenos comércios organizarem os serviços de manutenção dos seus computadores
e equipamentos: quem trouxe, o que deu problema, o que foi feito e em que pé está.
É pro responsável pelo comércio e pro técnico que faz a manutenção.

## Stack

- React 19 + TypeScript, Vite. Validação com Zod. Testes com Vitest.
- Regras de negócio em `src/services.ts`, sem nada de tela. Componentes em `src/components/`.
- Os dados ficam em memória (`useState` no `App.tsx`): ainda não há persistência.

## Comandos

- `npm install` — instala as dependências
- `npm run dev` — abre o sistema em http://localhost:5173
- `npm test` — roda os testes
- `npm run build` — confere os tipos e gera a versão final
- `npm run lint` — confere o padrão do código

## Regras

- Os testes em `tests/` são a especificação. **Nunca edite um teste pra fazê-lo passar** —
  corrija o código. Acrescentar teste novo pode.
- Antes de dizer que terminou, rode `npm test`, `npm run build` e `npm run lint` e mostre
  o resultado real.
- Antes de dizer que terminou, teste o fluxo completo do usuário, não só cada regra
  sozinha: cadastrar → avançar o status → registrar o serviço realizado → concluir. Se
  mudar uma regra, confira se a tela ainda deixa fazer esse caminho inteiro.
- Não instale nenhuma dependência sem me perguntar antes.
- Toda regra de negócio nova vai em `src/services.ts`, com teste escrito antes do código
  (skill `tdd`). Mensagens de erro em português, voltadas pra quem usa o sistema.

## Como eu quero trabalhar com você

- Antes de criar ou mudar arquivos, me mostre o plano e espere eu confirmar.
- Se um pedido meu entrar em conflito com uma regra que já existe, me avise e me dê as
  opções antes de fazer.

## Onde este projeto está

- https://github.com/ozielrsdev/repairhub
