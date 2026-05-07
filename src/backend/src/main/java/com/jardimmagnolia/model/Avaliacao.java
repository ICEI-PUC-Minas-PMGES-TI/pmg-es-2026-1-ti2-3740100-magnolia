package com.jardimmagnolia.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "avaliacao")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cliente_id")
    private Long clienteId;

    @NotBlank(message = "Nome do cliente é obrigatório")
    @Column(name = "cliente_nome", nullable = false)
    private String clienteNome;

    @Column(name = "produto_id")
    private Long produtoId;

    @Column(name = "produto_nome")
    private String produtoNome;

    @NotBlank(message = "Comentário é obrigatório")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String comentario;

    @Min(1) @Max(5)
    @Column(nullable = false)
    private Integer nota;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusAvaliacao status = StatusAvaliacao.PENDENTE;

    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
    }
}
