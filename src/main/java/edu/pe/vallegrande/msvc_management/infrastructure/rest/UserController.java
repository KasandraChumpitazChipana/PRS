package edu.pe.vallegrande.msvc_management.infrastructure.rest;

import edu.pe.vallegrande.msvc_management.application.service.UserService;
import edu.pe.vallegrande.msvc_management.infrastructure.dto.request.UserRequest;
import edu.pe.vallegrande.msvc_management.infrastructure.dto.response.UserResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "https://3000-vallegrande-vgwebeducat-gid9a8uvmpu.ws-us120.gitpod.io", allowCredentials = "true")
public class UserController {

    private final UserService service;

    @GetMapping("/")
    public Mono<ResponseEntity<Map<String, Object>>> rootHome() {
        return Mono.just(ResponseEntity.ok(Map.of(
                "message", "✅ API de Usuarios funcionando correctamente",
                "version", "1.0.0",
                "status", "OK",
                "endpoint", "/api/users",
                "timestamp", System.currentTimeMillis()
        )));
    }

    @GetMapping
    public Mono<ResponseEntity<Flux<UserResponse>>> findAll() {
        log.info("Controller: Finding all users");
        return Mono.just(ResponseEntity.ok(service.findAll()));
    }

    @GetMapping("/status/{status}")
    public Mono<ResponseEntity<Flux<UserResponse>>> findByStatus(@PathVariable Character status) {
        log.info("Controller: Finding users by status: {}", status);
        return Mono.just(ResponseEntity.ok(service.findByStatus(status)));
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<UserResponse>> findById(@PathVariable Long id) {
        log.info("Controller: Finding user by id: {}", id);
        return service.findById(id)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Mono<ResponseEntity<UserResponse>> save(@RequestBody UserRequest request) {
        log.info("Controller: Creating user: {}", request);
        return service.save(request)
                .map(user -> ResponseEntity.status(HttpStatus.CREATED).body(user))
                .onErrorResume(error -> {
                    log.error("Error creating user", error);
                    return Mono.just(ResponseEntity.badRequest().build());
                });
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<UserResponse>> update(@PathVariable Long id, @RequestBody UserRequest request) {
        log.info("Controller: Updating user with id: {}", id);
        return service.update(id, request)
                .map(ResponseEntity::ok)
                .onErrorResume(error -> {
                    log.error("Error updating user with id: {}", id, error);
                    return Mono.just(ResponseEntity.notFound().build());
                });
    }
    @GetMapping("/inactive")
    public Mono<ResponseEntity<Flux<UserResponse>>> listInactive() {
        log.info("Controller: Finding all inactive users");
        return Mono.just(ResponseEntity.ok(service.findInactive()));
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Map<String, Object>>> delete(@PathVariable Long id) {
        log.info("Controller: Deleting user with id: {}", id);
        return service.delete(id)
                .then(Mono.fromSupplier(() -> {
                    Map<String, Object> response = Map.of(
                            "message", "Usuario eliminado correctamente",
                            "id", id,
                            "timestamp", System.currentTimeMillis()
                    );
                    return ResponseEntity.ok(response);
                }))
                .onErrorResume(error -> {
                    log.error("Error deleting user with id: {}", id, error);
                    return Mono.just(ResponseEntity.notFound().build());
                });
                
    }
    @GetMapping("/role/{role}")
public Mono<ResponseEntity<Flux<UserResponse>>> findByRole(@PathVariable String role) {
    log.info("Controller: Finding users by role: {}", role);
    return Mono.just(ResponseEntity.ok(service.findByRole(role)));
}


    @PutMapping("/{id}/restore")
    public Mono<ResponseEntity<UserResponse>> restore(@PathVariable Long id) {
        log.info("Controller: Restoring user with id: {}", id);
        return service.restore(id)
                .map(ResponseEntity::ok)
                .onErrorResume(error -> {
                    log.error("Error restoring user with id: {}", id, error);
                    return Mono.just(ResponseEntity.notFound().build());
                });
    }
}