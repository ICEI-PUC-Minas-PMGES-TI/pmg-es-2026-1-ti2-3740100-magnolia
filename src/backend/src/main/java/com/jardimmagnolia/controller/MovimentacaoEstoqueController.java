package com.jardimmagnolia.controller;

import com.jardimmagnolia.model.MovimentacaoEstoque;
import com.jardimmagnolia.model.TipoMovimentacao;
import com.jardimmagnolia.repository.MovimentacaoEstoqueRepository;
import com.jardimmagnolia.repository.ProdutoRepository;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/movimentacoes")
public class MovimentacaoEstoqueController {

    private final MovimentacaoEstoqueRepository movRepo;
    private final ProdutoRepository produtoRepo;

    public MovimentacaoEstoqueController(MovimentacaoEstoqueRepository movRepo, ProdutoRepository produtoRepo) {
        this.movRepo = movRepo;
        this.produtoRepo = produtoRepo;
    }

    @GetMapping
    public List<MovimentacaoEstoque> listar() {
        return movRepo.findAllByOrderByCriadoEmDesc();
    }

    @GetMapping("/produto/{produtoId}")
    public List<MovimentacaoEstoque> porProduto(@PathVariable Long produtoId) {
        return movRepo.findByProdutoIdOrderByCriadoEmDesc(produtoId);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> registrar(@RequestBody MovimentacaoRequest req) {
        if (req.getProdutoId() == null || req.getTipo() == null || req.getQuantidade() == null || req.getQuantidade() < 1) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Dados inválidos. Verifique produto, tipo e quantidade."));
        }

        return produtoRepo.findById(req.getProdutoId()).map(produto -> {
            int estoqueAntes = produto.getEstoque();
            int novoEstoque;

            if (req.getTipo() == TipoMovimentacao.ENTRADA) {
                novoEstoque = estoqueAntes + req.getQuantidade();
            } else {
                novoEstoque = estoqueAntes - req.getQuantidade();
                if (novoEstoque < 0) {
                    return ResponseEntity.badRequest()
                            .<Object>body(Map.of("erro", "Estoque insuficiente. Disponível: " + estoqueAntes + " un."));
                }
            }

            produto.setEstoque(novoEstoque);
            produtoRepo.save(produto);

            MovimentacaoEstoque mov = MovimentacaoEstoque.builder()
                    .produtoId(produto.getId())
                    .produtoNome(produto.getNome())
                    .tipo(req.getTipo())
                    .quantidade(req.getQuantidade())
                    .estoqueAntes(estoqueAntes)
                    .estoqueDepois(novoEstoque)
                    .observacao(req.getObservacao())
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).<Object>body(movRepo.save(mov));
        }).orElse(ResponseEntity.notFound().<Object>build());
    }

    public static class MovimentacaoRequest {
        private Long produtoId;
        private TipoMovimentacao tipo;
        private Integer quantidade;
        private String observacao;

        public Long getProdutoId() { return produtoId; }
        public void setProdutoId(Long produtoId) { this.produtoId = produtoId; }

        public TipoMovimentacao getTipo() { return tipo; }
        public void setTipo(TipoMovimentacao tipo) { this.tipo = tipo; }

        public Integer getQuantidade() { return quantidade; }
        public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }

        public String getObservacao() { return observacao; }
        public void setObservacao(String observacao) { this.observacao = observacao; }
    }
}
