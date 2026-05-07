package com.jardimmagnolia.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimentacao_estoque")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimentacaoEstoque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "produto_id", nullable = false)
    private Long produtoId;

    @NotBlank
    @Column(name = "produto_nome", nullable = false)
    private String produtoNome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMovimentacao tipo;

    @Min(1)
    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "estoque_antes", nullable = false)
    private Integer estoqueAntes;

    @Column(name = "estoque_depois", nullable = false)
    private Integer estoqueDepois;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @Column(name = "criado_em", updatable = false, nullable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
    }
}
