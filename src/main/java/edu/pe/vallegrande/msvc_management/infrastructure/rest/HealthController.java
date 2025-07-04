package edu.pe.vallegrande.msvc_management.infrastructure.rest;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/health")
@Slf4j
public class HealthController {

    @GetMapping
    public Mono<ResponseEntity<Map<String, Object>>> health() {
        log.info("Health check solicitado");
        return Mono.just(ResponseEntity.ok(Map.of(
            "status", "UP",
            "timestamp", LocalDateTime.now(),
            "application", "msvc-management",
            "version", "1.0.0"
        )));
    }
}