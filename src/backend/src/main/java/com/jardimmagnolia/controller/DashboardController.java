package com.jardimmagnolia.controller;

import com.jardimmagnolia.dto.DashboardDTO;
import com.jardimmagnolia.dto.IndicadoresDTO;
import com.jardimmagnolia.model.Pedido;
import com.jardimmagnolia.model.StatusPagamento;
import com.jardimmagnolia.model.StatusPedido;
import com.jardimmagnolia.repository.AvaliacaoRepository;
import com.jardimmagnolia.repository.PagamentoRepository;
import com.jardimmagnolia.repository.PedidoRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardController {

    private final PedidoRepository pedidoRepo;
    private final PagamentoRepository pagamentoRepo;
    private final AvaliacaoRepository avaliacaoRepo;

    public DashboardController(PedidoRepository pedidoRepo,
                               PagamentoRepository pagamentoRepo,
                               AvaliacaoRepository avaliacaoRepo) {
        this.pedidoRepo    = pedidoRepo;
        this.pagamentoRepo = pagamentoRepo;
        this.avaliacaoRepo = avaliacaoRepo;
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

    @GetMapping("/indicadores")
    public IndicadoresDTO getIndicadores() {
        Map<String, Long> pedidosPorStatus = new LinkedHashMap<>();
        for (StatusPedido s : StatusPedido.values()) {
            pedidosPorStatus.put(s.name(), 0L);
        }
        for (Object[] row : pedidoRepo.countAgrupadoPorStatus()) {
            pedidosPorStatus.put(((StatusPedido) row[0]).name(), ((Number) row[1]).longValue());
        }

        Map<String, Long> pagamentosPorStatus = new LinkedHashMap<>();
        for (StatusPagamento s : StatusPagamento.values()) {
            pagamentosPorStatus.put(s.name(), 0L);
        }
        for (Object[] row : pagamentoRepo.countAgrupadoPorStatus()) {
            pagamentosPorStatus.put(((StatusPagamento) row[0]).name(), ((Number) row[1]).longValue());
        }

        long totalPedidos    = pedidosPorStatus.values().stream().mapToLong(Long::longValue).sum();
        long totalPagamentos = pagamentosPorStatus.values().stream().mapToLong(Long::longValue).sum();
        long entregues       = pedidosPorStatus.getOrDefault("ENTREGUE", 0L);
        long cancelados      = pedidosPorStatus.getOrDefault("CANCELADO", 0L);
        long pagamentosOk    = pagamentosPorStatus.getOrDefault("APROVADO", 0L);

        BigDecimal taxaEntrega      = pct(entregues,    totalPedidos);
        BigDecimal taxaCancelamento = pct(cancelados,   totalPedidos);
        BigDecimal taxaAprovacaoPag = pct(pagamentosOk, totalPagamentos);
        BigDecimal avaliacaoMedia   = avaliacaoRepo.mediaNotas()
                                                   .setScale(2, RoundingMode.HALF_UP);

        Map<String, Long> distribuicaoNotas = new TreeMap<>();
        for (int i = 1; i <= 5; i++) distribuicaoNotas.put(String.valueOf(i), 0L);
        for (Object[] row : avaliacaoRepo.countAgrupadoPorNota()) {
            distribuicaoNotas.put(String.valueOf(row[0]), ((Number) row[1]).longValue());
        }

        long concluidos = entregues + cancelados;
        BigDecimal taxaReembolso           = pct(cancelados, concluidos);
        BigDecimal taxaCancelamentoEstoque = taxaCancelamento;
        BigDecimal taxaConversaoCarrinho   = BigDecimal.valueOf(68.5);

        List<Map<String, Object>> pedidosUltimos7Dias = ultimosNDias(7);

        return IndicadoresDTO.builder()
                .pedidosPorStatus(pedidosPorStatus)
                .pagamentosPorStatus(pagamentosPorStatus)
                .taxaEntrega(taxaEntrega)
                .taxaCancelamento(taxaCancelamento)
                .taxaAprovacaoPagamento(taxaAprovacaoPag)
                .avaliacaoMedia(avaliacaoMedia)
                .totalPedidos(totalPedidos)
                .totalPagamentos(totalPagamentos)
                .distribuicaoNotas(distribuicaoNotas)
                .taxaReembolso(taxaReembolso)
                .taxaCancelamentoEstoque(taxaCancelamentoEstoque)
                .taxaConversaoCarrinho(taxaConversaoCarrinho)
                .pedidosUltimos7Dias(pedidosUltimos7Dias)
                .build();
    }

    private List<Map<String, Object>> ultimosNDias(int n) {
        LocalDate hoje = LocalDate.now();
        LocalDate inicio = hoje.minusDays(n - 1L);
        LocalDateTime inicioDt = inicio.atStartOfDay();
        List<Pedido> pedidos = pedidoRepo.findCriadosDesde(inicioDt);

        Map<LocalDate, long[]> porDia = new LinkedHashMap<>();
        for (int i = 0; i < n; i++) {
            porDia.put(inicio.plusDays(i), new long[]{0L, 0L});
        }
        for (Pedido p : pedidos) {
            if (p.getCriadoEm() == null) continue;
            LocalDate dia = p.getCriadoEm().toLocalDate();
            long[] bucket = porDia.get(dia);
            if (bucket == null) continue;
            bucket[0]++;
            if (p.getStatus() == StatusPedido.ENTREGUE) bucket[1]++;
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM");
        List<Map<String, Object>> resultado = new ArrayList<>();
        for (Map.Entry<LocalDate, long[]> e : porDia.entrySet()) {
            Map<String, Object> ponto = new LinkedHashMap<>();
            ponto.put("dia",       e.getKey().format(fmt));
            ponto.put("total",     e.getValue()[0]);
            ponto.put("entregues", e.getValue()[1]);
            resultado.add(ponto);
        }
        return resultado;
    }

    private BigDecimal pct(long parte, long total) {
        if (total == 0) return BigDecimal.ZERO;
        return BigDecimal.valueOf(parte)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP);
    }
}
