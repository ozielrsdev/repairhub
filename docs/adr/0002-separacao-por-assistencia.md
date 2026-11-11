# Um banco só, separado por assistência

Todas as assistências ficam no mesmo banco. Cada tabela tem o campo da assistência dona do
dado, e o Row Level Security do Postgres só deixa o dono logado ler e escrever as linhas da
própria assistência. Escolhemos isso porque, na escala do RepairHub, um banco ou esquema por
assistência só traria custo e trabalho de manutenção (migrações repetidas para cada uma), sem
ganho de segurança que o Row Level Security já não dê.

## Consequências

- Vazar dados de uma assistência para outra é o risco mais grave do produto. Por isso toda
  tabela nova nasce com o campo da assistência, com a regra de Row Level Security e com um
  teste automático mostrando que outra assistência não lê nem altera os dados.
- Mudar depois para um banco por assistência exigiria migrar todos os dados, por isso a
  decisão fica registrada aqui.
