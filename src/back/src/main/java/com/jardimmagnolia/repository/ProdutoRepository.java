package com.jardimmagnolia.repository;

import com.jardimmagnolia.model.CategoriaProduto;
import com.jardimmagnolia.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    List<Produto> findByAtivoTrue();
    List<Produto> findByCategoriaAndAtivoTrue(CategoriaProduto categoria);
    List<Produto> findAllByOrderByCategoriaAscNomeAsc();
    List<Produto> findByNomeContainingIgnoreCaseAndAtivoTrue(String nome);
}