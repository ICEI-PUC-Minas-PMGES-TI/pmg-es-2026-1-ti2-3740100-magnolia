package com.jardimmagnolia.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private BigDecimal vendasMes;
    private long       pedidosMes;
    private long       entregasPendentes;
    private BigDecimal lucroMes;
    private BigDecimal ticketMedio;
}