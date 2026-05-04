package com.jardimmagnolia.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cliente_id", nullable = false)
    private Long clienteId;

    @NotBlank(message = "Nome do cliente é obrigatório")
    @Column(name = "cliente_nome", nullable = false)
    private String clienteNome;

    @Email(message = "E-mail inválido")
    @Column(name = "cliente_email")
    private String clienteEmail;

    @Column(name = "cliente_telefone")
    private String clienteTelefone;

    @NotBlank(message = "Endereço de entrega é obrigatório")
    @Column(name = "endereco_entrega", nullable = false)
    private String enderecoEntrega;

    @Builder.Default
    @Column(name = "metodo_pagamento", nullable = false)
    private String metodoPagamento = "DINHEIRO_NA_ENTREGA";

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPedido status = StatusPedido.PENDENTE;

    @Builder.Default
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PedidoItem> itens = new ArrayList<>();

    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
    }
}