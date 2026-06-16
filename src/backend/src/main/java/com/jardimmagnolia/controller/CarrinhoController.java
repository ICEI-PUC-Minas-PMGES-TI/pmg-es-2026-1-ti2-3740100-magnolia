package com.jardimmagnolia.controller;

import com.jardimmagnolia.model.Carrinho;
import com.jardimmagnolia.model.StatusCarrinho;
import com.jardimmagnolia.repository.CarrinhoRepository;
import com.jardimmagnolia.repository.ClienteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/carrinhos")
public class CarrinhoController {

    private final CarrinhoRepository carrinhoRepo;
    private final ClienteRepository clienteRepo;

    public CarrinhoController(CarrinhoRepository carrinhoRepo, ClienteRepository clienteRepo) {
        this.carrinhoRepo = carrinhoRepo;
        this.clienteRepo  = clienteRepo;
    }

    @PostMapping("/iniciar")
    @Transactional
    public ResponseEntity<?> iniciar(@RequestBody Map<String, Object> body) {
        Long clienteId;
        try {
            clienteId = Long.valueOf(body.get("clienteId").toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "clienteId inválido."));
        }

        if (!clienteRepo.existsById(clienteId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Cliente não encontrado."));
        }

        Carrinho carrinho = carrinhoRepo
                .findFirstByClienteIdAndStatus(clienteId, StatusCarrinho.ABERTO)
                .orElseGet(() -> carrinhoRepo.save(Carrinho.builder()
                        .clienteId(clienteId)
                        .status(StatusCarrinho.ABERTO)
                        .build()));

        return ResponseEntity.ok(carrinho);
    }
}