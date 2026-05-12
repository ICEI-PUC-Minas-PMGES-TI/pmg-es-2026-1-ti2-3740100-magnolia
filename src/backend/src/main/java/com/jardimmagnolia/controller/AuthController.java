package com.jardimmagnolia.controller;

import com.jardimmagnolia.model.Cliente;
import com.jardimmagnolia.repository.ClienteRepository;
import com.jardimmagnolia.repository.EnderecoRepository;
import com.jardimmagnolia.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${app.admin.code}")
    private String adminCode;

    private final ClienteRepository clienteRepository;
    private final PedidoRepository pedidoRepository;
    private final EnderecoRepository enderecoRepository;

    public AuthController(ClienteRepository clienteRepository, PedidoRepository pedidoRepository, EnderecoRepository enderecoRepository) {
        this.clienteRepository = clienteRepository;
        this.pedidoRepository = pedidoRepository;
        this.enderecoRepository = enderecoRepository;
    }
    @PostMapping("/login")
    public ResponseEntity<?> loginAdmin(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");

        if (code != null && adminCode.equals(code.trim())) {
            return ResponseEntity.ok().body(Map.of("message", "Login autorizado"));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Código inválido"));
    }
    @PostMapping("/clientes/register")
    public ResponseEntity<?> cadastrarCliente(@RequestBody Map<String, String> payload) {
        String nome = value(payload.get("nome"));
        String email = value(payload.get("email")).toLowerCase();
        String senha = value(payload.get("senha"));

        if (nome.isBlank() || email.isBlank() || senha.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nome, e-mail e senha são obrigatórios."));
        }

        if (clienteRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "E-mail já cadastrado."));
        }

        Cliente cliente = Cliente.builder()
                .nome(nome)
                .email(email)
                .senhaHash(hashSenha(senha))
                .build();

        Cliente salvo = clienteRepository.save(cliente);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", salvo.getId(),
                "nome", salvo.getNome(),
                "email", salvo.getEmail(),
                "message", "Cadastro realizado com sucesso"
        ));
    }
    @PostMapping("/clientes/login")
    public ResponseEntity<?> loginCliente(@RequestBody Map<String, String> payload) {
        String email = value(payload.get("email")).toLowerCase();
        String senha = value(payload.get("senha"));

        if (email.isBlank() || senha.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "E-mail e senha são obrigatórios."));
        }

        return clienteRepository.findByEmailIgnoreCase(email)
                .map(cliente -> {
                    if (!cliente.getSenhaHash().equals(hashSenha(senha))) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Credenciais inválidas."));
                    }

                    return ResponseEntity.ok(Map.of(
                            "id", cliente.getId(),
                            "nome", cliente.getNome(),
                            "email", cliente.getEmail(),
                            "message", "Login realizado com sucesso"
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Credenciais inválidas.")));
    }

    @GetMapping("/admin/clientes")
    public ResponseEntity<?> listarClientes() {
        List<Map<String, Object>> lista = clienteRepository.findAll().stream()
                .map(c -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id",        c.getId());
                    m.put("nome",      c.getNome());
                    m.put("email",     c.getEmail());
                    m.put("criadoEm",  c.getCriadoEm());
                    m.put("enderecos", enderecoRepository.findByClienteId(c.getId()));
                    return m;
                })
                .toList();
        return ResponseEntity.ok(lista);
    }

    @PatchMapping("/clientes/{clienteId}")
    public ResponseEntity<?> atualizarConta(
            @PathVariable Long clienteId,
            @RequestBody Map<String, String> payload) {

        String senhaAtual = value(payload.get("senhaAtual"));
        String novoEmail  = value(payload.get("novoEmail")).toLowerCase();
        String novaSenha  = value(payload.get("novaSenha"));

        if (senhaAtual.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "A senha atual é obrigatória."));
        }
        if (novoEmail.isBlank() && novaSenha.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Informe um novo e-mail ou uma nova senha."));
        }

        return clienteRepository.findById(clienteId)
                .map(cliente -> {
                    if (!cliente.getSenhaHash().equals(hashSenha(senhaAtual))) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("message", "Senha atual incorreta."));
                    }

                    if (!novoEmail.isBlank()) {
                        if (clienteRepository.existsByEmailIgnoreCase(novoEmail)
                                && !cliente.getEmail().equalsIgnoreCase(novoEmail)) {
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                                    .body(Map.of("message", "Este e-mail já está em uso por outra conta."));
                        }
                        cliente.setEmail(novoEmail);
                    }

                    if (!novaSenha.isBlank()) {
                        cliente.setSenhaHash(hashSenha(novaSenha));
                    }

                    clienteRepository.save(cliente);
                    return ResponseEntity.ok(Map.of(
                            "id",    cliente.getId(),
                            "nome",  cliente.getNome(),
                            "email", cliente.getEmail(),
                            "message", "Dados atualizados com sucesso."
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Cliente não encontrado.")));
    }

    @DeleteMapping("/clientes/{clienteId}")
    public ResponseEntity<?> excluirConta(@PathVariable Long clienteId) {
        if (!clienteRepository.existsById(clienteId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Cliente não encontrado."));
        }

        enderecoRepository.deleteByClienteId(clienteId);
        pedidoRepository.deleteByClienteId(clienteId);
        clienteRepository.deleteById(clienteId);
        return ResponseEntity.ok(Map.of("message", "Conta excluída com sucesso."));
    }

    private String value(String raw) {
        return raw == null ? "" : raw.trim();
    }

    private String hashSenha(String senha) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(senha.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Falha ao processar senha", e);
        }
    }
}