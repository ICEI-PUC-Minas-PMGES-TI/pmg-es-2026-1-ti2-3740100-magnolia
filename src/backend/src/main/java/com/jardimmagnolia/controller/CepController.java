package com.jardimmagnolia.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@RestController
@RequestMapping("/api/cep")
public class CepController {

    private final HttpClient http = HttpClient.newHttpClient();

    @GetMapping("/{cep}")
    public ResponseEntity<?> consultar(@PathVariable String cep) {
        String digits = cep.replaceAll("\\D", "");
        if (digits.length() != 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "CEP deve ter 8 dígitos."));
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://viacep.com.br/ws/" + digits + "/json/"))
                    .GET()
                    .build();

            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200 && !response.body().contains("\"erro\"")) {
                return ResponseEntity.ok()
                        .header("Content-Type", "application/json")
                        .body(response.body());
            }

            return ResponseEntity.status(404).body(Map.of("message", "CEP não encontrado."));
        } catch (IOException | InterruptedException e) {
            return ResponseEntity.status(503).body(Map.of("message", "Serviço de CEP indisponível."));
        }
    }
}
