package com.jardimmagnolia.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IndicadoresDTO {

    private Map<String, Long> pedidosPorStatus;
    private Map<String, Long> pagamentosPorStatus;

    private BigDecimal taxaEntrega;
    private BigDecimal taxaAprovacaoPagamento;
    private BigDecimal taxaCancelamento;
    private BigDecimal avaliacaoMedia;

    private long totalPedidos;
    private long totalPagamentos;

    private Map<String, Long> distribuicaoNotas;

    private BigDecimal taxaReembolso;
    private BigDecimal taxaCancelamentoEstoque;
    private BigDecimal taxaConversaoCarrinho;

    private List<Map<String, Object>> pedidosUltimos7Dias;
}