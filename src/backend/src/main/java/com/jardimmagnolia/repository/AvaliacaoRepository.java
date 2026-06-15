package com.jardimmagnolia.repository;

import com.jardimmagnolia.model.Avaliacao;
import com.jardimmagnolia.model.StatusAvaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    List<Avaliacao> findByStatus(StatusAvaliacao status);
    List<Avaliacao> findByProdutoIdAndStatus(Long produtoId, StatusAvaliacao status);
    List<Avaliacao> findByProdutoId(Long produtoId);

    @Query("SELECT COALESCE(AVG(a.nota), 0) FROM Avaliacao a")
    BigDecimal mediaNotas();
}
