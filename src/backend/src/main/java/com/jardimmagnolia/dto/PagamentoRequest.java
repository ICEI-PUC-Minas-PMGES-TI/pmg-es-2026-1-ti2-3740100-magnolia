package com.jardimmagnolia.dto;

import com.jardimmagnolia.model.MetodoPagamento;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PagamentoRequest {
    private Long pedidoId;
    private MetodoPagamento metodo;
    private BigDecimal valor;
    
    // Campos opcionais - so vem preenchidos para CARTAO_*
    private String numeroCartao;
    private String nomeTitular;
    private String cvv;
    private String validade;
}
