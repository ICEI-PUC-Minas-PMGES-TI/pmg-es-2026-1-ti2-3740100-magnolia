package com.jardimmagnolia.controller;
import com.jardimmagnolia.dto.PagamentoRequest;
import com.jardimmagnolia.model.*;
import com.jardimmagnolia.repository.PagamentoRepository;
import com.jardimmagnolia.repository.PedidoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;
@RestController
@RequestMapping("/api/pagamentos")
public class PagamentoController {
private final PagamentoRepository pagamentoRepo;
private final PedidoRepository pedidoRepo;
public PagamentoController(PagamentoRepository pagamentoRepo,
PedidoRepository pedidoRepo) {
this.pagamentoRepo = pagamentoRepo;
this.pedidoRepo = pedidoRepo;
}
@PostMapping
@Transactional
public ResponseEntity<?> processar(@RequestBody PagamentoRequest req) {
if (req.getPedidoId() == null || req.getMetodo() == null
|| req.getValor() == null) {
return ResponseEntity.badRequest()
.body(Map.of("message", "Pedido, metodo e valor sao obrigatorios."));
}
return pedidoRepo.findById(req.getPedidoId()).<ResponseEntity<?>>map(pedido -> {
// Evita pagamento duplicado para o mesmo pedido
if (pagamentoRepo.findByPedidoId(pedido.getId()).isPresent()) {
return ResponseEntity.status(HttpStatus.CONFLICT)
.body(Map.of("message",
"Este pedido ja possui um pagamento registrado."));
}
Pagamento.PagamentoBuilder builder = Pagamento.builder()
.pedidoId(pedido.getId())
.metodo(req.getMetodo())
.valor(req.getValor());
// Processamento simulado conforme o metodo escolhido
switch (req.getMetodo()) {
case CARTAO_CREDITO:
case CARTAO_DEBITO: {
String num = req.getNumeroCartao() == null ? "" : req.getNumeroCartao().replaceAll("\\s", "");
if (num.length() < 4 || req.getNomeTitular() == null
|| req.getNomeTitular().isBlank()) {
return ResponseEntity.badRequest()
.body(Map.of("message", "Dados do cartao invalidos."));
}
// Simulacao: aprova automaticamente
builder.cartaoUltimosDigitos(num.substring(num.length() - 4))
.cartaoTitular(req.getNomeTitular().trim())
.status(StatusPagamento.APROVADO);
break;
}
case PIX: {
// Gera um "codigo copia-e-cola" ficticio
String codigo = "00020126580014BR.GOV.BCB.PIX0136"
+ UUID.randomUUID().toString().toUpperCase()
+ "5204000053039865802BR5913JARDIM MAGNOLIA6304"
+ String.format("%04X", (int)(Math.random() * 0xFFFF));
builder.pixCodigo(codigo).status(StatusPagamento.APROVADO);
break;
}
case DINHEIRO: {
// Pagamento em dinheiro fica pendente ate a entrega
builder.status(StatusPagamento.PENDENTE);
break;
}
}
Pagamento salvo = pagamentoRepo.save(builder.build());
// Atualiza metodo de pagamento e status do pedido
pedido.setMetodoPagamento(req.getMetodo().name());
if (salvo.getStatus() == StatusPagamento.APROVADO) {
pedido.setStatus(StatusPedido.EM_ROTA);
}
pedidoRepo.save(pedido);
return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
}).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
.body(Map.of("message", "Pedido nao encontrado.")));
}
@GetMapping("/pedido/{pedidoId}")
public ResponseEntity<?> buscarPorPedido(@PathVariable Long pedidoId) {
return pagamentoRepo.findByPedidoId(pedidoId)
.<ResponseEntity<?>>map(ResponseEntity::ok)
.orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
.body(Map.of("message", "Pagamento nao encontrado.")));
}
@GetMapping("/admin")
public ResponseEntity<?> listarTodos() {
return ResponseEntity.ok(pagamentoRepo.findAllByOrderByCriadoEmDesc());

    }
}
