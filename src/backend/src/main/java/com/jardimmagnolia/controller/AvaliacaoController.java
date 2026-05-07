package com.jardimmagnolia.controller;

import com.jardimmagnolia.model.Avaliacao;
import com.jardimmagnolia.model.StatusAvaliacao;
import com.jardimmagnolia.repository.AvaliacaoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AvaliacaoController {

    private final AvaliacaoRepository repo;

    public AvaliacaoController(AvaliacaoRepository repo) {
        this.repo = repo;
    }

    // Público: todas aprovadas (home page)
    @GetMapping("/avaliacoes")
    public List<Avaliacao> listarAprovadas() {
        return repo.findByStatus(StatusAvaliacao.APROVADA);
    }

    // Público: aprovadas de um produto (product page)
    @GetMapping("/avaliacoes/produto/{produtoId}")
    public List<Avaliacao> listarPorProduto(@PathVariable Long produtoId) {
        return repo.findByProdutoIdAndStatus(produtoId, StatusAvaliacao.APROVADA);
    }

    // Público: criar avaliação
    @PostMapping("/avaliacoes")
    public ResponseEntity<Avaliacao> criar(@RequestBody Avaliacao avaliacao) {
        avaliacao.setStatus(StatusAvaliacao.PENDENTE);
        return ResponseEntity.ok(repo.save(avaliacao));
    }

    // Admin: listar todas
    @GetMapping("/admin/avaliacoes")
    public List<Avaliacao> listarTodas() {
        return repo.findAll();
    }

    // Admin: atualizar status
    @PatchMapping("/admin/avaliacoes/{id}/status")
    public ResponseEntity<Avaliacao> atualizarStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return repo.findById(id).map(av -> {
            av.setStatus(StatusAvaliacao.valueOf(body.get("status")));
            return ResponseEntity.ok(repo.save(av));
        }).orElse(ResponseEntity.notFound().build());
    }
}
