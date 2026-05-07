package com.jardimmagnolia.repository;

import com.jardimmagnolia.model.MovimentacaoEstoque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MovimentacaoEstoqueRepository extends JpaRepository<MovimentacaoEstoque, Long> {
    List<MovimentacaoEstoque> findAllByOrderByCriadoEmDesc();
    List<MovimentacaoEstoque> findByProdutoIdOrderByCriadoEmDesc(Long produtoId);
}
