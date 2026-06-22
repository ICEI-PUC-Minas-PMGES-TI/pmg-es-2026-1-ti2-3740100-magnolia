package com.jardimmagnolia.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "produto_imagem")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProdutoImagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "produto_id", nullable = false)
    private Long produtoId;

    @Column(name = "content_type", length = 80)
    private String contentType;

    @Column(name = "nome_original")
    private String nomeOriginal;

    @Builder.Default
    @Column(nullable = false)
    private Integer ordem = 0;

    @Builder.Default
    @Column(name = "principal", nullable = false)
    private Boolean principal = false;

    @JsonIgnore
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "dados", nullable = false)
    private byte[] dados;

    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
    }
}