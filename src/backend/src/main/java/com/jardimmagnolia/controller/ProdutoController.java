package com.jardimmagnolia.controller;

import com.jardimmagnolia.model.CategoriaProduto;
import com.jardimmagnolia.model.Produto;
import com.jardimmagnolia.model.ProdutoImagem;
import com.jardimmagnolia.repository.ProdutoImagemRepository;
import com.jardimmagnolia.repository.ProdutoRepository;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoRepository repo;
    private final ProdutoImagemRepository imagemRepo;

    public ProdutoController(ProdutoRepository repo, ProdutoImagemRepository imagemRepo) {
        this.repo = repo;
        this.imagemRepo = imagemRepo;
    }

    @GetMapping
    public List<Produto> listar() {
        return repo.findByAtivoTrue();
    }

    @GetMapping("/categoria/{categoria}")
    public List<Produto> porCategoria(@PathVariable CategoriaProduto categoria) {
        return repo.findByCategoriaAndAtivoTrue(categoria);
    }

    @GetMapping("/admin")
    public List<Produto> listarAdmin() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscar(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/buscar")
    public List<Produto> buscarPorNome(@RequestParam String nome) {
        return repo.findByNomeContainingIgnoreCaseAndAtivoTrue(nome);
    }

    @GetMapping("/{id}/imagens")
    public List<Map<String, Object>> listarImagensDoProduto(@PathVariable Long id) {
        return imagemRepo.findByProdutoIdOrderByOrdemAsc(id).stream()
                .map(img -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", img.getId());
                    m.put("ordem", img.getOrdem());
                    m.put("principal", img.getPrincipal());
                    m.put("contentType", img.getContentType());
                    m.put("nomeOriginal", img.getNomeOriginal());
                    m.put("url", "/api/produtos/imagens/" + img.getId());
                    return m;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/imagens/{imagemId}")
    public ResponseEntity<byte[]> servirImagem(@PathVariable Long imagemId) {
        return imagemRepo.findById(imagemId)
                .map(img -> {
                    MediaType tipo = img.getContentType() == null
                            ? MediaType.IMAGE_JPEG
                            : MediaType.parseMediaType(img.getContentType());
                    return ResponseEntity.ok()
                            .contentType(tipo)
                            .cacheControl(org.springframework.http.CacheControl.maxAge(java.time.Duration.ofDays(7)).cachePublic())
                            .body(img.getDados());
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<Produto> cadastrar(
            @RequestParam("nome")       String nome,
            @RequestParam("descricao")  String descricao,
            @RequestParam("preco")      BigDecimal preco,
            @RequestParam("categoria")  CategoriaProduto categoria,
            @RequestParam(value = "imagens", required = false) List<MultipartFile> imagens
    ) throws IOException {

        Produto p = Produto.builder()
                .nome(nome)
                .descricao(descricao)
                .preco(preco)
                .estoque(0)
                .categoria(categoria)
                .ativo(true)
                .build();

        Produto salvo = repo.save(p);
        salvarImagens(salvo.getId(), imagens, true);
        sincronizarImagemUrl(salvo);

        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(salvo));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<Produto> editar(
            @PathVariable Long id,
            @RequestParam("nome")       String nome,
            @RequestParam("descricao")  String descricao,
            @RequestParam("preco")      BigDecimal preco,
            @RequestParam("categoria")  CategoriaProduto categoria,
            @RequestParam(value = "imagens", required = false) List<MultipartFile> imagens,
            @RequestParam(value = "imagensMantidas", required = false) String imagensMantidas
    ) throws IOException {

        return repo.findById(id).map(p -> {
            p.setNome(nome);
            p.setDescricao(descricao);
            p.setPreco(preco);
            p.setCategoria(categoria);

            Set<Long> idsParaManter = parseIds(imagensMantidas);
            List<ProdutoImagem> atuais = imagemRepo.findByProdutoIdOrderByOrdemAsc(id);
            for (ProdutoImagem atual : atuais) {
                if (!idsParaManter.contains(atual.getId())) {
                    imagemRepo.delete(atual);
                }
            }

            try {
                boolean naoSobrouNenhuma = idsParaManter.isEmpty();
                salvarImagens(id, imagens, naoSobrouNenhuma);
            } catch (IOException e) {
                throw new RuntimeException("Erro ao salvar imagens", e);
            }

            sincronizarImagemUrl(p);
            return ResponseEntity.ok(repo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Produto> toggle(@PathVariable Long id) {
        return repo.findById(id).map(p -> {
            p.setAtivo(!p.getAtivo());
            return ResponseEntity.ok(repo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        imagemRepo.deleteByProdutoId(id);
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/imagens/{imagemId}")
    @Transactional
    public ResponseEntity<Void> removerImagem(@PathVariable Long imagemId) {
        return imagemRepo.findById(imagemId).map(img -> {
            imagemRepo.delete(img);
            repo.findById(img.getProdutoId()).ifPresent(this::sincronizarImagemUrl);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    private void salvarImagens(Long produtoId, List<MultipartFile> imagens, boolean primeiraVirarPrincipal) throws IOException {
        if (imagens == null || imagens.isEmpty()) return;

        long existentes = imagemRepo.countByProdutoId(produtoId);
        int ordem = (int) existentes;
        boolean jaTemPrincipal = imagemRepo.findByProdutoIdOrderByOrdemAsc(produtoId).stream()
                .anyMatch(ProdutoImagem::getPrincipal);

        for (MultipartFile f : imagens) {
            if (f == null || f.isEmpty()) continue;
            boolean principal = primeiraVirarPrincipal && !jaTemPrincipal && ordem == (int) existentes;
            ProdutoImagem img = ProdutoImagem.builder()
                    .produtoId(produtoId)
                    .contentType(f.getContentType())
                    .nomeOriginal(f.getOriginalFilename())
                    .ordem(ordem++)
                    .principal(principal)
                    .dados(f.getBytes())
                    .build();
            imagemRepo.save(img);
            if (principal) jaTemPrincipal = true;
        }
    }

    private void sincronizarImagemUrl(Produto p) {
        List<ProdutoImagem> imagens = imagemRepo.findByProdutoIdOrderByOrdemAsc(p.getId());
        if (imagens.isEmpty()) {
            p.setImagemUrl(null);
            return;
        }
        ProdutoImagem principal = imagens.stream()
                .filter(ProdutoImagem::getPrincipal)
                .findFirst()
                .orElse(imagens.get(0));
        p.setImagemUrl("/api/produtos/imagens/" + principal.getId());
    }

    private Set<Long> parseIds(String raw) {
        if (raw == null || raw.isBlank()) return Set.of();
        Set<Long> ids = new HashSet<>();
        for (String s : raw.split(",")) {
            try { ids.add(Long.parseLong(s.trim())); } catch (Exception ignored) {}
        }
        return ids;
    }
}