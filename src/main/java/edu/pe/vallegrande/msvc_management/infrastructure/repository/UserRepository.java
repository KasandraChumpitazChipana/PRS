package edu.pe.vallegrande.msvc_management.infrastructure.repository;

import edu.pe.vallegrande.msvc_management.domain.model.User;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface UserRepository {
    Flux<User> findAll();
    Mono<User> findById(Long id);
    Mono<User> save(User user);
    Mono<Void> delete(Long id);
    Mono<User> restore(Long id);
    // AGREGADO: Método faltante para filtrar por status
    Flux<User> findByStatus(Character status);
    Flux<User> findByRole(String role);
    Flux<User> findInactive();
}