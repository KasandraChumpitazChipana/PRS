package edu.pe.vallegrande.msvc_management.application.service;

import edu.pe.vallegrande.msvc_management.infrastructure.dto.request.UserRequest;
import edu.pe.vallegrande.msvc_management.infrastructure.dto.response.UserResponse;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface UserService {
    Flux<UserResponse> findAll();
    Mono<UserResponse> findById(Long id);
    Mono<UserResponse> save(UserRequest request);
    Mono<UserResponse> update(Long id, UserRequest request);
    Mono<Void> delete(Long id);
    Mono<UserResponse> restore(Long id);
    Flux<UserResponse> findByStatus(Character status);
    Flux<UserResponse> findByRole(String role);
    Flux<UserResponse> findInactive();
}