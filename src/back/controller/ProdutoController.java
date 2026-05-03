package com.jardimmagnolia.controller;

import com.jardimmagnolia.model.CategoriaProduto;
import com.jardimmagnolia.model.Produto;
import com.jardimmagnolia.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoRepository repo;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public ProdutoController(ProdutoRepository repo) {
        this.repo = repo;
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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Produto> cadastrar(
            @RequestParam("nome")       String nome,
            @RequestParam("descricao")  String descricao,
            @RequestParam("preco")      BigDecimal preco,
            @RequestParam("estoque")    Integer estoque,
            @RequestParam("categoria")  CategoriaProduto categoria,
            @RequestParam(value = "imagem", required = false) MultipartFile imagem,
            @RequestParam(value = "imagensExtras", required = false) List<MultipartFile> imagensExtras,
            @RequestParam(value = "imagensExtrasExistentes", required = false) String imagensExtrasExistentes
    ) throws IOException {

        String imagemUrl = null;
        if (imagem != null && !imagem.isEmpty()) {
            imagemUrl = salvarImagem(imagem);
        }

        String extrasUrl = processarExtras(imagensExtras, imagensExtrasExistentes);

        Produto p = Produto.builder()
                .nome(nome)
                .descricao(descricao)
                .preco(preco)
                .estoque(estoque)
                .categoria(categoria)
                .ativo(true)
                .imagemUrl(imagemUrl)
                .imagensExtras(extrasUrl)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(p));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Produto> editar(
            @PathVariable Long id,
            @RequestParam("nome")       String nome,
            @RequestParam("descricao")  String descricao,
            @RequestParam("preco")      BigDecimal preco,
            @RequestParam("estoque")    Integer estoque,
            @RequestParam("categoria")  CategoriaProduto categoria,
            @RequestParam(value = "imagem", required = false) MultipartFile imagem,
            @RequestParam(value = "imagensExtras", required = false) List<MultipartFile> imagensExtras,
            @RequestParam(value = "imagensExtrasExistentes", required = false) String imagensExtrasExistentes
    ) throws IOException {

        return repo.findById(id).map(p -> {
            p.setNome(nome);
            p.setDescricao(descricao);
            p.setPreco(preco);
            p.setEstoque(estoque);
            p.setCategoria(categoria);

            if (imagem != null && !imagem.isEmpty()) {
                try { p.setImagemUrl(salvarImagem(imagem)); }
                catch (IOException e) { throw new RuntimeException("Erro ao salvar imagem", e); }
            }

            try {
                String extrasUrl = processarExtras(imagensExtras, imagensExtrasExistentes);
                p.setImagensExtras(extrasUrl);
            } catch (IOException e) {
                throw new RuntimeException("Erro ao salvar imagens extras", e);
            }

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
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private String salvarImagem(MultipartFile file) throws IOException {
        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        String ext = Optional.ofNullable(file.getOriginalFilename())
                .filter(f -> f.contains("."))
                .map(f -> f.substring(f.lastIndexOf(".")))
                .orElse(".jpg");
        String filename = UUID.randomUUID() + ext;
        Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/produtos/" + filename;
    }

    private String processarExtras(List<MultipartFile> novasExtras, String existentesRaw) throws IOException {
        List<String> urls = new ArrayList<>();

        if (existentesRaw != null && !existentesRaw.isBlank()) {
            Arrays.stream(existentesRaw.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .forEach(urls::add);
        }

        if (novasExtras != null) {
            for (MultipartFile f : novasExtras) {
                if (f != null && !f.isEmpty()) {
                    urls.add(salvarImagem(f));
                }
            }
        }

        return urls.isEmpty() ? null : String.join(",", urls);
    }
}