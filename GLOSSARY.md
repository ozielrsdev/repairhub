# RepairHub

Plataforma para assistências técnicas organizarem o atendimento dos equipamentos que os
clientes trazem: o que chegou, o que deu problema, quanto vai custar, o que foi feito e
quando foi entregue.

## Quem participa

**Assistência**:
A empresa que usa o RepairHub para atender os próprios clientes. Cada assistência só enxerga
os próprios dados.
_Evite_: loja, empresa, cliente (para a assistência), conta

**Dono**:
A pessoa responsável pela assistência e a única que entra no sistema.
_Evite_: usuário, administrador

**Funcionário**:
Quem trabalha na assistência e pode ser o técnico responsável por uma Ordem de Serviço. Não
entra no sistema.
_Evite_: usuário, colaborador

**Técnico responsável**:
O funcionário encarregado do conserto de uma Ordem de Serviço.
_Evite_: responsável, atendente

**Cliente**:
A pessoa física ou jurídica que traz um equipamento para a assistência.
_Evite_: solicitante, consumidor, cliente (para a assistência)

## O atendimento

**Equipamento**:
O aparelho de um cliente que passa pela assistência, identificado por tipo, marca, modelo e
número de série.
_Evite_: máquina, aparelho, produto

**Ordem de Serviço (OS)**:
O atendimento de um equipamento de um cliente, do recebimento até a entrega ou a devolução.
Cada equipamento trazido é uma OS.
_Evite_: serviço, chamado, atendimento, ticket

**Acessório entregue**:
Algo que o cliente deixa junto com o equipamento, como carregador, cabo ou capa.
_Evite_: item, peça

**Diagnóstico**:
O que o técnico descobriu que está causando o problema relatado.
_Evite_: laudo, análise

**Serviço realizado**:
A descrição do que foi feito no equipamento.
_Evite_: solução, reparo

**Urgência**:
O quanto a OS precisa ser atendida antes das outras: Baixa, Média, Alta ou Crítica.
_Evite_: prioridade

**Retorno em garantia**:
Uma nova OS aberta para um equipamento que voltou com problema dentro da garantia de uma OS
anterior, e ligada a ela.
_Evite_: reabertura, retrabalho

## Status da OS

**Recebido**:
O equipamento chegou e ainda não foi examinado.

**Em análise**:
O técnico está examinando o equipamento para chegar ao diagnóstico e ao orçamento.

**Aguardando aprovação**:
O orçamento foi passado ao cliente, que ainda não aprovou nem recusou.

**Em manutenção**:
O cliente aprovou o orçamento e o conserto está sendo feito.

**Concluído**:
O conserto terminou e o equipamento espera o cliente retirar.
_Evite_: pronto, finalizado (para entregue)

**Entregue**:
O cliente retirou o equipamento e pagou.
_Evite_: concluído, finalizado

**Devolvido sem conserto**:
O cliente recusou o orçamento e o equipamento volta sem conserto, com ou sem taxa de
diagnóstico.
_Evite_: cancelado

## Dinheiro e documentos

**Orçamento**:
A proposta de preço de uma OS, com itens, desconto e total, que o cliente aprova ou recusa.
Se mudar depois de aprovado, vira uma nova versão, que precisa de nova aprovação.
_Evite_: valor, preço, cotação

**Item**:
Uma linha do orçamento: mão de obra ou peça, com descrição, quantidade e valor unitário.
_Evite_: produto, serviço (para a linha)

**Taxa de diagnóstico**:
O valor que a assistência pode cobrar quando o cliente recusa o orçamento, pelo trabalho de
examinar o equipamento.
_Evite_: taxa de visita, taxa de análise

**Pagamento**:
Um valor que o cliente pagou numa OS, com a forma de pagamento. Uma OS pode ter mais de um
pagamento, e a soma fecha o total.
_Evite_: cobrança, recebimento

**Garantia**:
O prazo em que a assistência se compromete a resolver de novo, sem custo, um problema do
serviço realizado.
_Evite_: cobertura

**Comprovante**:
O PDF emitido para o cliente, com os dados daquele momento. Pode ser do orçamento ou do
fechamento. Não tem valor fiscal.
_Evite_: nota, nota fiscal, recibo

**Nota fiscal**:
O documento fiscal oficial (NFS-e ou NF-e). Ainda não existe no RepairHub.
_Evite_: comprovante (para a nota)
