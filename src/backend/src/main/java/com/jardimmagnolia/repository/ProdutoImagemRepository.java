package com.jardimmagnolia.repository;

import com.jardimmagnolia.model.ProdutoImagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProdutoImagemRepository extends JpaRepository<ProdutoImagem, Long> {

    List<ProdutoImagem> findByProdutoIdOrderByOrdemAsc(Long produtoId);

    void deleteByProdutoId(Long produtoId);

    long countByProdutoId(Long produtoId);
}