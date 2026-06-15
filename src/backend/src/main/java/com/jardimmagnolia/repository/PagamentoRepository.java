package com.jardimmagnolia.repository;

import com.jardimmagnolia.model.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {
    Optional<Pagamento> findByPedidoId(Long pedidoId);
    List<Pagamento> findAllByOrderByCriadoEmDesc();

    @Query("SELECT pg.status, COUNT(pg) FROM Pagamento pg GROUP BY pg.status")
    List<Object[]> countAgrupadoPorStatus();
}
