package com.jardimmagnolia.repository;

import com.jardimmagnolia.model.Carrinho;
import com.jardimmagnolia.model.StatusCarrinho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface CarrinhoRepository extends JpaRepository<Carrinho, Long> {

    Optional<Carrinho> findFirstByClienteIdAndStatus(Long clienteId, StatusCarrinho status);

    @Query("SELECT COUNT(c) FROM Carrinho c WHERE c.criadoEm <= :corte")
    long countMaduros(@Param("corte") LocalDateTime corte);

    @Query("SELECT COUNT(c) FROM Carrinho c WHERE c.criadoEm <= :corte AND c.status = 'FINALIZADO'")
    long countFinalizadosMaduros(@Param("corte") LocalDateTime corte);
}