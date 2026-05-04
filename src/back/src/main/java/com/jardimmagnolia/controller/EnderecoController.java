package com.jardimmagnolia.controller;

import com.jardimmagnolia.model.Endereco;
import com.jardimmagnolia.repository.ClienteRepository;
import com.jardimmagnolia.repository.EnderecoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/clientes")
public class EnderecoController {

    private final EnderecoRepository enderecoRepository;
    private final ClienteRepository clienteRepository;

    public EnderecoController(EnderecoRepository enderecoRepository, ClienteRepository clienteRepository) {
        this.enderecoRepository = enderecoRepository;
        this.clienteRepository = clienteRepository;
    }

    @GetMapping("/{clienteId}/enderecos")
    public ResponseEntity<?> listar(@PathVariable Long clienteId) {
        if (!clienteRepository.existsById(clienteId))
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(enderecoRepository.findByClienteId(clienteId));
    }

    @PostMapping("/{clienteId}/enderecos")
    public ResponseEntity<?> criar(@PathVariable Long clienteId, @RequestBody Map<String, String> body) {
        if (!clienteRepository.existsById(clienteId))
            return ResponseEntity.notFound().build();

        String cep    = v(body.get("cep"));
        String rua    = v(body.get("rua"));
        String bairro = v(body.get("bairro"));
        String numero = v(body.get("numero"));
        String cidade = v(body.get("cidade"));
        String uf     = v(body.get("uf"));

        if (cep.isBlank() || rua.isBlank() || bairro.isBlank() || numero.isBlank() || cidade.isBlank() || uf.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "CEP, rua, bairro, número, cidade e UF são obrigatórios."));
        }

        Endereco endereco = Endereco.builder()
                .clienteId(clienteId)
                .apelido(v(body.get("apelido")))
                .cep(cep)
                .rua(rua)
                .bairro(bairro)
                .numero(numero)
                .complemento(v(body.get("complemento")))
                .cidade(cidade)
                .uf(uf.toUpperCase())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(enderecoRepository.save(endereco));
    }

    @PutMapping("/{clienteId}/enderecos/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long clienteId, @PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Endereco> opt = enderecoRepository.findById(id)
                .filter(e -> e.getClienteId().equals(clienteId));
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Endereco e = opt.get();
        if (!v(body.get("cep")).isBlank())    e.setCep(v(body.get("cep")));
        if (!v(body.get("rua")).isBlank())    e.setRua(v(body.get("rua")));
        if (!v(body.get("bairro")).isBlank()) e.setBairro(v(body.get("bairro")));
        if (!v(body.get("numero")).isBlank()) e.setNumero(v(body.get("numero")));
        if (!v(body.get("cidade")).isBlank()) e.setCidade(v(body.get("cidade")));
        if (!v(body.get("uf")).isBlank())     e.setUf(v(body.get("uf")).toUpperCase());
        e.setApelido(v(body.get("apelido")));
        e.setComplemento(v(body.get("complemento")));

        return ResponseEntity.ok(enderecoRepository.save(e));
    }

    @DeleteMapping("/{clienteId}/enderecos/{id}")
    public ResponseEntity<?> remover(@PathVariable Long clienteId, @PathVariable Long id) {
        Optional<Endereco> opt = enderecoRepository.findById(id)
                .filter(e -> e.getClienteId().equals(clienteId));
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        enderecoRepository.delete(opt.get());
        return ResponseEntity.ok(Map.of("message", "Endereço removido."));
    }

    private String v(String s) {
        return s == null ? "" : s.trim();
    }
}