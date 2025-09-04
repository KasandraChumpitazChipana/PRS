package pe.edu.vallegrande.vgmsuser.application.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import pe.edu.vallegrande.vgmsuser.application.service.IKeycloakService;
import pe.edu.vallegrande.vgmsuser.application.service.IUserManagementService;
import pe.edu.vallegrande.vgmsuser.application.service.IUserProfileService;
import pe.edu.vallegrande.vgmsuser.domain.model.User;
import pe.edu.vallegrande.vgmsuser.domain.model.UserProfile;
import pe.edu.vallegrande.vgmsuser.domain.model.enums.UserStatus;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import pe.edu.vallegrande.vgmsuser.infraestructure.util.MailService;
import reactor.core.scheduler.Schedulers;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserManagementServiceImpl implements IUserManagementService {

    private final IKeycloakService keycloakService;
    private final IUserProfileService userProfileService;
    private final MailService mailService;

    @Override
    public Mono<String> createCompleteUser(User user) {
        log.info("Creating complete user with username: {}", user.getUsername());

        return keycloakService.createUser(user)
                .flatMap(keycloakResponse -> {
                    String keycloakId = extractKeycloakIdFromResponse(keycloakResponse);

                    if (keycloakId != null && !keycloakResponse.contains("Error")) {
                        UserProfile userProfile = UserProfile.builder()
                                .keycloakId(keycloakId)
                                .username(user.getUsername())
                                .email(user.getEmail())
                                .documentType(user.getDocumentType())
                                .documentNumber(user.getDocumentNumber())
                                .phone(user.getPhone())
                                .status(user.getStatus() != null ? user.getStatus() : UserStatus.ACTIVE)
                                .build();

                        return userProfileService.createUserProfile(userProfile)
                                .flatMap(savedProfile ->
                                        // Enviar correo en un hilo elástico (bloqueante) y continuar
                                        Mono.fromRunnable(() -> mailService.sendForcePasswordChangeEmail(
                                                        user.getEmail(), user.getUsername()))
                                                .subscribeOn(Schedulers.boundedElastic())
                                                .thenReturn("Usuario creado exitosamente. Keycloak ID: " + keycloakId +
                                                        ", MongoDB ID: " + savedProfile.getId())
                                )
                                .onErrorResume(mongoError -> {
                                    log.error("Error creating user profile in MongoDB, rolling back Keycloak user: {}", mongoError.getMessage());
                                    return keycloakService.deleteUser(keycloakId)
                                            .then(Mono.error(new RuntimeException("Error creating user profile: " + mongoError.getMessage())));
                                });
                    } else {
                        return Mono.just(keycloakResponse);
                    }
                })
                .doOnSuccess(result -> log.info("Complete user creation finished: {}", result))
                .doOnError(error -> log.error("Error creating complete user: {}", error.getMessage()));
    }

    @Override
    public Mono<UserProfile> getCompleteUserByKeycloakId(String keycloakId) {
        log.debug("Getting complete user by keycloakId: {}", keycloakId);
        return userProfileService.findByKeycloakId(keycloakId);
    }

    @Override
    public Mono<UserProfile> getCompleteUserByUsername(String username) {
        log.debug("Getting complete user by username: {}", username);
        return userProfileService.findByUsername(username);
    }

    @Override
    public Mono<String> updateCompleteUser(String keycloakId, User user) {
        log.info("Updating complete user with keycloakId: {}", keycloakId);
        
        return userProfileService.findByKeycloakId(keycloakId)
                .switchIfEmpty(Mono.error(new RuntimeException("User not found")))
                .flatMap(existingProfile -> {
                    // Actualizar en Keycloak
                    return keycloakService.updateUser(keycloakId, user)
                            .then(Mono.defer(() -> {
                                // Actualizar perfil en MongoDB
                                UserProfile updatedProfile = UserProfile.builder()
                                        .id(existingProfile.getId())
                                        .keycloakId(keycloakId)
                                        .username(user.getUsername())
                                        .email(user.getEmail())
                                        .documentType(user.getDocumentType())
                                        .documentNumber(user.getDocumentNumber())
                                        .phone(user.getPhone())
                                        .status(user.getStatus() != null ? user.getStatus() : existingProfile.getStatus())
                                        .createdAt(existingProfile.getCreatedAt())
                                        .build();
                                
                                return userProfileService.updateUserProfile(keycloakId, updatedProfile);
                            }))
                            .map(updatedProfile -> "Usuario actualizado exitosamente. Keycloak ID: " + keycloakId);
                })
                .doOnSuccess(result -> log.info("Complete user update finished: {}", result))
                .doOnError(error -> log.error("Error updating complete user: {}", error.getMessage()));
    }

    @Override
    public Mono<String> deleteCompleteUser(String keycloakId) {
        log.info("Deleting complete user with keycloakId: {}", keycloakId);
        
        return userProfileService.findByKeycloakId(keycloakId)
                .switchIfEmpty(Mono.error(new RuntimeException("User not found")))
                .flatMap(userProfile -> {
                    // Eliminar de Keycloak primero
                    return keycloakService.deleteUser(keycloakId)
                            .then(userProfileService.deleteUserProfile(keycloakId))
                            .map(v -> "Usuario eliminado exitosamente. Keycloak ID: " + keycloakId);
                })
                .doOnSuccess(result -> log.info("Complete user deletion finished: {}", result))
                .doOnError(error -> log.error("Error deleting complete user: {}", error.getMessage()));
    }

    @Override
    public Flux<UserProfile> getAllCompleteUsers() {
        log.debug("Getting all complete users");
        return userProfileService.findAllUserProfiles();
    }

    @Override
    public Mono<UserProfile> changeUserStatus(String keycloakId, UserStatus status) {
        log.info("Changing user status to {} for keycloakId: {}", status, keycloakId);
        return userProfileService.updateUserStatus(keycloakId, status);
    }

    @Override
    public Flux<UserProfile> getUsersByStatus(UserStatus status) {
        log.debug("Getting users by status: {}", status);
        return userProfileService.findByStatus(status);
    }

    private String extractKeycloakIdFromResponse(String response) {
        if (response != null && response.contains("Usuario creado exitosamente con ID: ")) {
            try {
                String[] parts = response.split("Usuario creado exitosamente con ID: ");
                if (parts.length > 1) {
                    return parts[1].trim();
                }
            } catch (Exception e) {
                log.error("Error extracting Keycloak ID from response: {}", e.getMessage());
            }
        }
        return null;
    }
}
