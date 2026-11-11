# Supabase como back-end

O RepairHub precisa de banco, login e separação entre assistências para virar uma plataforma
vendida a várias assistências. Escolhemos o Supabase (Postgres, Auth e Storage) porque ele
entrega prontas as três partes mais arriscadas: o login com as senhas guardadas por ele, o
banco relacional e a separação por assistência no próprio banco (Row Level Security). Assim
o esforço vai para o produto, e não para infraestrutura.

## Opções consideradas

- **Firebase**: também tem login pronto, mas é banco de documentos, ruim para as relações
  Cliente → Equipamento → Ordem de Serviço → Orçamento.
- **Back-end próprio** (Node + Postgres + biblioteca de autenticação): mais controle, mas
  bem mais trabalho, e a segurança do login ficaria por nossa conta.

## Consequências

- Com um banco na internet, a tela não é mais a única porta: qualquer um pode chamar o banco
  direto. As regras de negócio continuam em `src/services.ts`, puras e testadas, mas as
  críticas (separação por assistência, mudanças de status, não apagar OS com comprovante
  emitido) também são garantidas no banco.
- A chave secreta do Supabase (`service_role`) nunca vai para o front-end.
- Como o banco é Postgres, dá pra sair do Supabase levando os dados, se for preciso. O que
  daria trabalho trocar é o login.
