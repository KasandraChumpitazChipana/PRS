package pe.edu.vallegrande.vgmsuser.application.service;

import java.util.List;

import org.keycloak.representations.idm.UserRepresentation;

import pe.edu.vallegrande.vgmsuser.domain.model.User;
import reactor.core.publisher.Mono;

public interface IKeycloakService {
    Mono<List<UserRepresentation>> findAllUsers();
    Mono<List<UserRepresentation>> searchUserByUsername(String username);
    Mono<String> createUser(User userDTO);
    Mono<Void> deleteUser(String userId);
    Mono<Void> updateUser(String userId, User userDTO);
}