package edu.pe.vallegrande.msvc_management.application.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import edu.pe.vallegrande.msvc_management.application.service.UserService;
import edu.pe.vallegrande.msvc_management.domain.model.User;
import edu.pe.vallegrande.msvc_management.infrastructure.dto.request.UserRequest;
import edu.pe.vallegrande.msvc_management.infrastructure.dto.response.UserResponse;
import edu.pe.vallegrande.msvc_management.infrastructure.exception.ResourceNotFoundException;
import edu.pe.vallegrande.msvc_management.infrastructure.repository.UserRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository repository;

    @Override
    public Flux<UserResponse> findAll() {
        return repository.findAll().map(this::toResponse);
    }

    @Override
    public Mono<UserResponse> findById(Long id) {
        return repository.findById(id)
                .map(this::toResponse)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Usuario no encontrado con ID: " + id)));
    }
    @Override
    public Flux<UserResponse> findByRole(String role) {
        return repository.findByRole(role).map(this::toResponse);
    }


    @Override
    public Mono<UserResponse> save(UserRequest request) {
        User user = toEntity(request);
        user.setStatus('A'); // Estado activo por defecto
        return repository.save(user).map(this::toResponse);
    }

    @Override
    public Mono<UserResponse> update(Long id, UserRequest request) {
        return repository.findById(id)
                .flatMap(existing -> {
                    User user = toEntity(request);
                    user.setId(id);
                    return repository.save(user);
                })
                .map(this::toResponse)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Usuario no encontrado con ID: " + id)));
    }

    @Override
    public Mono<Void> delete(Long id) {
        return repository.delete(id);
    }

    @Override
    public Flux<UserResponse> findInactive() {
        return repository
            .findInactive()
            .map(this::toResponse);
    }

    @Override
    public Mono<UserResponse> restore(Long id) {
        return repository.findById(id)
                .flatMap(user -> {
                    user.setStatus('A');
                    return repository.save(user);
                })
                .map(this::toResponse)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Usuario no encontrado con ID: " + id)));
    }

    // AGREGADO: Implementación del método findByStatus
    @Override
    public Flux<UserResponse> findByStatus(Character status) {
        return repository.findByStatus(status).map(this::toResponse);
    }

    private User toEntity(UserRequest request) {
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setDocumentType(request.getDocumentType());
        user.setDocumentNumber(request.getDocumentNumber());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setUserImageBase64(request.getUserImageBase64());
        user.setRole(request.getRole());
        user.setStatus(request.getStatus() != null ? request.getStatus() : 'A');
        return user;
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .documentType(user.getDocumentType())
                .documentNumber(user.getDocumentNumber())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .userImageBase64(user.getUserImageBase64())
                .build();
    }
}