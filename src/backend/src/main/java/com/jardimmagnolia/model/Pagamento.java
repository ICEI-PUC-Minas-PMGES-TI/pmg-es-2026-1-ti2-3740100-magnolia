package com.jardimmagnolia.model; 

import jakarta.persistence.*; 
import jakarta.validation.constraints.NotNull; 
import lombok.*; 

import java.math.BigDecimal; 
import java.time.LocalDateTime; 

@Entity 
@Table(name = "pagamento") 
@Data 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder 
public class Pagamento {    
    @Id    
    @GeneratedValue(strategy = GenerationType.IDENTITY)    
    private Long id;    
    
    @NotNull    
    @Column(name = "pedido_id", nullable = false)    
    private Long pedidoId;    
    
    @NotNull    
    @Enumerated(EnumType.STRING)    
    @Column(nullable = false)    
    private MetodoPagamento metodo;    
    
    @Builder.Default    
    @Enumerated(EnumType.STRING)    
    @Column(nullable = false)    
    private StatusPagamento status = StatusPagamento.PENDENTE;

    @NotNull    
    @Column(nullable = false, precision = 10, scale = 2)    
    private BigDecimal valor;    
    
    // Apenas ultimos 4 digitos do cartao (ficticio)    
    @Column(name = "cartao_ultimos_digitos", length = 4)    
    private String cartaoUltimosDigitos;    
    
    @Column(name = "cartao_titular")    
    private String cartaoTitular;    
    
    // Para PIX (codigo copia-e-cola ficticio)    
    @Column(name = "pix_codigo", columnDefinition = "TEXT")    
    private String pixCodigo;    
    
    @Column(name = "criado_em", updatable = false)    
    private LocalDateTime criadoEm;    
    
    @PrePersist    
    protected void onCreate() {        
        criadoEm = LocalDateTime.now();    
    } 
}