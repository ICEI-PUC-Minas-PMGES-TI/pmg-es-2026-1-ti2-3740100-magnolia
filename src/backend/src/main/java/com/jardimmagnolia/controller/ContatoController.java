package com.jardimmagnolia.controller;

import com.jardimmagnolia.model.Contato;
import com.jardimmagnolia.model.StatusContato;
import com.jardimmagnolia.repository.ContatoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ContatoController {

    private final ContatoRepository repo;

    public ContatoController(ContatoRepository repo) {
        this.repo = repo;
    }

    // Público: receber mensagem de contato
    @PostMapping("/contato")
    public ResponseEntity<?> receber(@RequestBody Contato contato) {
        contato.setStatus(StatusContato.ABERTO);
        return ResponseEntity.ok(repo.save(contato));
    }

    // Admin: listar todas as mensagens
    @GetMapping("/admin/contatos")
    public List<Contato> listar() {
        return repo.findAll();
    }

    // Admin: atualizar status da mensagem
    @PatchMapping("/admin/contatos/{id}/status")
    public ResponseEntity<Contato> atualizarStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return repo.findById(id).map(c -> {
            c.setStatus(StatusContato.valueOf(body.get("status")));
            return ResponseEntity.ok(repo.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }
}
