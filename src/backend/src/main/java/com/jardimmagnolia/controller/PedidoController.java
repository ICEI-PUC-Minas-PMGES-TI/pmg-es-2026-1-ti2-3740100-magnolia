package com.jardimmagnolia.controller;

import com.jardimmagnolia.model.*;
import com.jardimmagnolia.repository.ClienteRepository;
import com.jardimmagnolia.repository.MovimentacaoEstoqueRepository;
import com.jardimmagnolia.repository.PedidoRepository;
import com.jardimmagnolia.repository.ProdutoRepository;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoRepository repo;
    private final ClienteRepository clienteRepository;
    private final ProdutoRepository produtoRepo;
    private final MovimentacaoEstoqueRepository movRepo;

    public PedidoController(PedidoRepository repo,
                             ClienteRepository clienteRepository,
                             ProdutoRepository produtoRepo,
                             MovimentacaoEstoqueRepository movRepo) {
        this.repo = repo;
        this.clienteRepository = clienteRepository;
        this.produtoRepo = produtoRepo;
        this.movRepo = movRepo;
    }

    @GetMapping
    public List<Pedido> listar() {
        return repo.findAllByOrderByCriadoEmDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> buscar(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public List<Pedido> porStatus(@PathVariable StatusPedido status) {
        return repo.findByStatus(status);
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<?> listarPorCliente(@PathVariable Long clienteId) {
        if (!clienteRepository.existsById(clienteId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Cliente não encontrado."));
        }
        return ResponseEntity.ok(repo.findByClienteIdOrderByCriadoEmDesc(clienteId));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> criar(@RequestBody Pedido pedido) {
        if (pedido.getClienteId() == null || !clienteRepository.existsById(pedido.getClienteId())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Você precisa estar logado para finalizar a compra."));
        }

        Map<Long, Integer> totalPorProduto = new HashMap<>();
        if (pedido.getItens() != null && !pedido.getItens().isEmpty()) {
            for (PedidoItem item : pedido.getItens()) {
                if (item.getProduto() == null || item.getProduto().getId() == null) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Item do pedido sem produto identificado."));
                }
                int qtd = item.getQuantidade() == null ? 0 : item.getQuantidade();
                if (qtd <= 0) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Quantidade inválida no carrinho."));
                }
                totalPorProduto.merge(item.getProduto().getId(), qtd, Integer::sum);
            }

            for (Map.Entry<Long, Integer> e : totalPorProduto.entrySet()) {
                Produto produto = produtoRepo.findById(e.getKey()).orElse(null);
                if (produto == null) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Produto não encontrado (id " + e.getKey() + ")."));
                }
                int disponivel = produto.getEstoque() == null ? 0 : produto.getEstoque();
                if (disponivel < e.getValue()) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(Map.of(
                                    "message", "Estoque insuficiente para \"" + produto.getNome() + "\". "
                                            + "Disponível: " + disponivel + " un., necessário: " + e.getValue() + " un.",
                                    "produtoId", produto.getId(),
                                    "disponivel", disponivel,
                                    "solicitado", e.getValue()
                            ));
                }
            }
        }

        pedido.setStatus(StatusPedido.PENDENTE);
        pedido.setMetodoPagamento("PENDENTE");

        if (pedido.getItens() != null) {
            pedido.getItens().forEach(item -> item.setPedido(pedido));
        }

        Pedido salvo = repo.save(pedido);

        for (Map.Entry<Long, Integer> e : totalPorProduto.entrySet()) {
            Produto produto = produtoRepo.findById(e.getKey()).orElseThrow();
            int antes  = produto.getEstoque();
            int depois = antes - e.getValue();
            produto.setEstoque(depois);
            produtoRepo.save(produto);
            movRepo.save(MovimentacaoEstoque.builder()
                    .produtoId(produto.getId())
                    .produtoNome(produto.getNome())
                    .tipo(TipoMovimentacao.SAIDA)
                    .quantidade(e.getValue())
                    .estoqueAntes(antes)
                    .estoqueDepois(depois)
                    .observacao("Pedido #" + String.format("%05d", salvo.getId()) + " confirmado — estoque abatido")
                    .build());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @PatchMapping("/{id}/status")
    @Transactional
    public ResponseEntity<?> atualizarStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        return repo.findById(id).map(p -> {
            StatusPedido novoStatus;
            try {
                novoStatus = StatusPedido.valueOf(body.get("status").toUpperCase());
            } catch (Exception e) {
                return ResponseEntity.badRequest()
                        .<Object>body(Map.of("message", "Status inválido."));
            }

            StatusPedido statusAnterior = p.getStatus();

            if (novoStatus == StatusPedido.CANCELADO && statusAnterior != StatusPedido.CANCELADO) {
                restaurarEstoque(p, "cancelado pelo admin");
            }

            p.setStatus(novoStatus);
            return ResponseEntity.ok(repo.save(p));
        }).orElse(ResponseEntity.notFound().<Object>build());
    }

    @PostMapping("/{id}/devolucao")
    @Transactional
    public ResponseEntity<?> solicitarDevolucao(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Long clienteId;
        try {
            clienteId = Long.parseLong(body.getOrDefault("clienteId", "0"));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cliente inválido."));
        }

        return repo.findById(id).map(pedido -> {
            if (!pedido.getClienteId().equals(clienteId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Este pedido não pertence ao cliente informado."));
            }
            if (pedido.getStatus() == StatusPedido.CANCELADO) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Este pedido já está cancelado."));
            }
            restaurarEstoque(pedido, "devolução solicitada pelo cliente");
            pedido.setStatus(StatusPedido.CANCELADO);
            repo.save(pedido);
            return ResponseEntity.ok(Map.of("message", "Solicitação de devolução registrada."));
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Pedido não encontrado.")));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deletar(@PathVariable Long id) {
        return repo.findById(id).map(p -> {
            if (p.getStatus() != StatusPedido.CANCELADO) {
                restaurarEstoque(p, "pedido removido");
            }
            repo.delete(p);
            return ResponseEntity.ok(Map.of("message", "Pedido removido."));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/cart/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
                "ok",      true,
                "message", "Item adicionado ao carrinho."
        ));
    }

    private void restaurarEstoque(Pedido p, String motivo) {
        List<PedidoItem> itens = p.getItens();
        if (itens == null || itens.isEmpty()) return;

        Map<Long, Integer> totalPorProduto = new HashMap<>();
        for (PedidoItem item : itens) {
            if (item.getProduto() == null || item.getProduto().getId() == null) continue;
            int qtd = item.getQuantidade() == null ? 0 : item.getQuantidade();
            if (qtd <= 0) continue;
            totalPorProduto.merge(item.getProduto().getId(), qtd, Integer::sum);
        }

        for (Map.Entry<Long, Integer> e : totalPorProduto.entrySet()) {
            Produto produto = produtoRepo.findById(e.getKey()).orElse(null);
            if (produto == null) continue;
            int antes  = produto.getEstoque() == null ? 0 : produto.getEstoque();
            int depois = antes + e.getValue();
            produto.setEstoque(depois);
            produtoRepo.save(produto);
            movRepo.save(MovimentacaoEstoque.builder()
                    .produtoId(produto.getId())
                    .produtoNome(produto.getNome())
                    .tipo(TipoMovimentacao.ENTRADA)
                    .quantidade(e.getValue())
                    .estoqueAntes(antes)
                    .estoqueDepois(depois)
                    .observacao("Pedido #" + String.format("%05d", p.getId()) + " — " + motivo + " (estoque revertido)")
                    .build());
        }
    }
}