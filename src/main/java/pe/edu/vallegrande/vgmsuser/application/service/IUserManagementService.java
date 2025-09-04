package pe.edu.vallegrande.vgmsuser.application.service;

import pe.edu.vallegrande.vgmsuser.domain.model.User;
import pe.edu.vallegrande.vgmsuser.domain.model.UserProfile;
import pe.edu.vallegrande.vgmsuser.domain.model.enums.UserStatus;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface IUserManagementService {
    
    /**
     * Crear usuario completo (Keycloak + MongoDB)
     */
    Mono<String> createCompleteUser(User user);
    
    /**
     * Obtener usuario completo con información de MongoDB
     */
    Mono<UserProfile> getCompleteUserByKeycloakId(String keycloakId);
    
    /**
     * Obtener usuario completo por username
     */
    Mono<UserProfile> getCompleteUserByUsername(String username);
    
    /**
     * Actualizar usuario completo
     */
    Mono<String> updateCompleteUser(String keycloakId, User user);
    
    /**
     * Eliminar usuario completo (Keycloak + MongoDB)
     */
    Mono<String> deleteCompleteUser(String keycloakId);
    
    /**
     * Listar todos los usuarios con información completa
     */
    Flux<UserProfile> getAllCompleteUsers();
    
    /**
     * Cambiar estado del usuario
     */
    Mono<UserProfile> changeUserStatus(String keycloakId, UserStatus status);
    
    /**
     * Buscar usuarios por estado
     */
    Flux<UserProfile> getUsersByStatus(UserStatus status);
}
