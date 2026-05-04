package com.jardimmagnolia.controller;

import com.jardimmagnolia.dto.DashboardDTO;
import com.jardimmagnolia.model.StatusPedido;
import com.jardimmagnolia.repository.PedidoRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;

@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardController {

    private final PedidoRepository pedidoRepo;

    public DashboardController(PedidoRepository pedidoRepo) {
        this.pedidoRepo = pedidoRepo;
    }
    @GetMapping
    public DashboardDTO getDashboard() {
        LocalDateTime inicioMes = LocalDateTime.now()
                .with(TemporalAdjusters.firstDayOfMonth())
                .toLocalDate().atStartOfDay();

        LocalDateTime fimMes = LocalDateTime.now()
                .with(TemporalAdjusters.lastDayOfMonth())
                .toLocalDate().atTime(23, 59, 59);

        BigDecimal vendasMes = pedidoRepo.totalVendasDesde(inicioMes);
        long pedidosMes      = pedidoRepo.findPedidosDoMes(inicioMes, fimMes).size();
        long pendentes       = pedidoRepo.countByStatus(StatusPedido.PENDENTE)
                             + pedidoRepo.countByStatus(StatusPedido.EM_ROTA);

        BigDecimal lucroMes = vendasMes
                .multiply(BigDecimal.valueOf(0.53))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal ticketMedio = pedidosMes > 0
                ? vendasMes.divide(BigDecimal.valueOf(pedidosMes), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return DashboardDTO.builder()
                .vendasMes(vendasMes)
                .pedidosMes(pedidosMes)
                .entregasPendentes(pendentes)
                .lucroMes(lucroMes)
                .ticketMedio(ticketMedio)
                .build();
    }
}