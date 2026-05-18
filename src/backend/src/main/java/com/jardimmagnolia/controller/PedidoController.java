package com.jardimmagnolia.controller;

import com.jardimmagnolia.model.*;
import com.jardimmagnolia.repository.ClienteRepository;
import com.jardimmagnolia.repository.MovimentacaoEstoqueRepository;
import com.jardimmagnolia.repository.PedidoRepository;
import com.jardimmagnolia.repository.ProdutoRepository;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

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

        pedido.setStatus(StatusPedido.PENDENTE);
        pedido.setMetodoPagamento("PENDENTE");

        if (pedido.getItens() != null) {
            pedido.getItens().forEach(item -> item.setPedido(pedido));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(pedido));
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

            // Baixa de estoque ao enviar para entrega
            if (novoStatus == StatusPedido.EM_ROTA && statusAnterior != StatusPedido.EM_ROTA) {
                List<PedidoItem> itens = p.getItens();
                if (itens != null && !itens.isEmpty()) {
                    // Verificar disponibilidade antes de debitar
                    for (PedidoItem item : itens) {
                        Produto produto = produtoRepo.findById(item.getProduto().getId()).orElse(null);
                        if (produto == null) continue;
                        if (produto.getEstoque() < item.getQuantidade()) {
                            return ResponseEntity.badRequest()
                                    .<Object>body(Map.of("message",
                                            "Estoque insuficiente para \"" + produto.getNome() + "\". "
                                            + "Disponível: " + produto.getEstoque() + " un., necessário: " + item.getQuantidade() + " un."));
                        }
                    }
                    // Debitar estoque e registrar movimentação
                    for (PedidoItem item : itens) {
                        Produto produto = produtoRepo.findById(item.getProduto().getId()).orElse(null);
                        if (produto == null) continue;
                        int estoqueAntes = produto.getEstoque();
                        int estoqueDepois = estoqueAntes - item.getQuantidade();
                        produto.setEstoque(estoqueDepois);
                        produtoRepo.save(produto);
                        movRepo.save(MovimentacaoEstoque.builder()
                                .produtoId(produto.getId())
                                .produtoNome(produto.getNome())
                                .tipo(TipoMovimentacao.SAIDA)
                                .quantidade(item.getQuantidade())
                                .estoqueAntes(estoqueAntes)
                                .estoqueDepois(estoqueDepois)
                                .observacao("Pedido #" + String.format("%05d", p.getId()) + " saiu para entrega")
                                .build());
                    }
                }
            }

            // Restaurar estoque ao cancelar um pedido que já estava em rota
            if (novoStatus == StatusPedido.CANCELADO && statusAnterior == StatusPedido.EM_ROTA) {
                List<PedidoItem> itens = p.getItens();
                if (itens != null && !itens.isEmpty()) {
                    for (PedidoItem item : itens) {
                        Produto produto = produtoRepo.findById(item.getProduto().getId()).orElse(null);
                        if (produto == null) continue;
                        int estoqueAntes = produto.getEstoque();
                        int estoqueDepois = estoqueAntes + item.getQuantidade();
                        produto.setEstoque(estoqueDepois);
                        produtoRepo.save(produto);
                        movRepo.save(MovimentacaoEstoque.builder()
                                .produtoId(produto.getId())
                                .produtoNome(produto.getNome())
                                .tipo(TipoMovimentacao.ENTRADA)
                                .quantidade(item.getQuantidade())
                                .estoqueAntes(estoqueAntes)
                                .estoqueDepois(estoqueDepois)
                                .observacao("Pedido #" + String.format("%05d", p.getId()) + " cancelado — estoque revertido")
                                .build());
                    }
                }
            }

            p.setStatus(novoStatus);
            return ResponseEntity.ok(repo.save(p));
        }).orElse(ResponseEntity.notFound().<Object>build());
    }

    @PostMapping("/{id}/devolucao")
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
            pedido.setStatus(StatusPedido.CANCELADO);
            repo.save(pedido);
            return ResponseEntity.ok(Map.of("message", "Solicitação de devolução registrada."));
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Pedido não encontrado.")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Long id) {
        if (!repo.existsById(id))
            return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Pedido removido."));
    }

    @PostMapping("/cart/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
                "ok",      true,
                "message", "Item adicionado ao carrinho."
        ));
    }
}