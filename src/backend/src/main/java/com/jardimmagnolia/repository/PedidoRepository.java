package com.jardimmagnolia.repository;

import com.jardimmagnolia.model.Pedido;
import com.jardimmagnolia.model.StatusPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByStatus(StatusPedido status);

    List<Pedido> findAllByOrderByCriadoEmDesc();
    List<Pedido> findByClienteIdOrderByCriadoEmDesc(Long clienteId);

    @Query("SELECT p FROM Pedido p WHERE p.criadoEm >= :inicio AND p.criadoEm <= :fim ORDER BY p.criadoEm DESC")
    List<Pedido> findPedidosDoMes(@Param("inicio") LocalDateTime inicio,
                                   @Param("fim")    LocalDateTime fim);

    @Query("SELECT COALESCE(SUM(p.total), 0) FROM Pedido p WHERE p.criadoEm >= :inicio AND p.status <> 'CANCELADO'")
    BigDecimal totalVendasDesde(@Param("inicio") LocalDateTime inicio);

    long countByStatus(StatusPedido status);

    boolean existsByClienteIdAndStatusNot(Long clienteId, StatusPedido status);

    void deleteByClienteId(Long clienteId);

    @Query("SELECT p.status, COUNT(p) FROM Pedido p GROUP BY p.status")
    List<Object[]> countAgrupadoPorStatus();
}