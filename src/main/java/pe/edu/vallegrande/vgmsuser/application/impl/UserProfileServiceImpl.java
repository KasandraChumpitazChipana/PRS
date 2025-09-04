package pe.edu.vallegrande.vgmsuser.application.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import pe.edu.vallegrande.vgmsuser.application.service.IUserProfileService;
import pe.edu.vallegrande.vgmsuser.domain.model.UserProfile;
import pe.edu.vallegrande.vgmsuser.domain.model.enums.UserStatus;
import pe.edu.vallegrande.vgmsuser.infraestructure.repository.UserProfileRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements IUserProfileService {

    private final UserProfileRepository userProfileRepository;

    @Override
    public Mono<UserProfile> createUserProfile(UserProfile userProfile) {
        log.info("Creating user profile for keycloakId: {}", userProfile.getKeycloakId());
        
        return validateUserProfile(userProfile)
                .then(Mono.defer(() -> {
                    userProfile.setCreatedAt(LocalDateTime.now());
                    return userProfileRepository.save(userProfile);
                }))
                .doOnSuccess(saved -> log.info("User profile created successfully with id: {}", saved.getId()))
                .doOnError(error -> log.error("Error creating user profile: {}", error.getMessage()));
    }

    @Override
    public Mono<UserProfile> updateUserProfile(String keycloakId, UserProfile userProfile) {
        log.info("Updating user profile for keycloakId: {}", keycloakId);
        
        return userProfileRepository.findByKeycloakId(keycloakId)
                .switchIfEmpty(Mono.error(new RuntimeException("User profile not found")))
                .flatMap(existingProfile -> {
                    // Preserve ID and keycloakId
                    userProfile.setId(existingProfile.getId());
                    userProfile.setKeycloakId(keycloakId);
                    userProfile.setCreatedAt(existingProfile.getCreatedAt());
                    userProfile.setUpdatedAt(LocalDateTime.now());
                    
                    return userProfileRepository.save(userProfile);
                })
                .doOnSuccess(updated -> log.info("User profile updated successfully for keycloakId: {}", keycloakId))
                .doOnError(error -> log.error("Error updating user profile: {}", error.getMessage()));
    }

    @Override
    public Mono<UserProfile> findByKeycloakId(String keycloakId) {
        log.debug("Finding user profile by keycloakId: {}", keycloakId);
        return userProfileRepository.findByKeycloakId(keycloakId);
    }

    @Override
    public Mono<UserProfile> findByUsername(String username) {
        log.debug("Finding user profile by username: {}", username);
        return userProfileRepository.findByUsername(username);
    }

    @Override
    public Mono<UserProfile> findByEmail(String email) {
        log.debug("Finding user profile by email: {}", email);
        return userProfileRepository.findByEmail(email);
    }

    @Override
    public Mono<UserProfile> findByDocumentNumber(String documentNumber) {
        log.debug("Finding user profile by document number: {}", documentNumber);
        return userProfileRepository.findByDocumentNumber(documentNumber);
    }

    @Override
    public Flux<UserProfile> findByStatus(UserStatus status) {
        log.debug("Finding user profiles by status: {}", status);
        return userProfileRepository.findByStatus(status);
    }

    @Override
    public Flux<UserProfile> findAllUserProfiles() {
        log.debug("Finding all user profiles");
        return userProfileRepository.findAll();
    }

    @Override
    public Mono<Void> deleteUserProfile(String keycloakId) {
        log.info("Deleting user profile for keycloakId: {}", keycloakId);
        
        return userProfileRepository.findByKeycloakId(keycloakId)
                .switchIfEmpty(Mono.error(new RuntimeException("User profile not found")))
                .flatMap(userProfileRepository::delete)
                .doOnSuccess(v -> log.info("User profile deleted successfully for keycloakId: {}", keycloakId))
                .doOnError(error -> log.error("Error deleting user profile: {}", error.getMessage()));
    }

    @Override
    public Mono<UserProfile> updateUserStatus(String keycloakId, UserStatus status) {
        log.info("Updating user status to {} for keycloakId: {}", status, keycloakId);
        
        return userProfileRepository.findByKeycloakId(keycloakId)
                .switchIfEmpty(Mono.error(new RuntimeException("User profile not found")))
                .flatMap(userProfile -> {
                    userProfile.setStatus(status);
                    userProfile.setUpdatedAt(LocalDateTime.now());
                    return userProfileRepository.save(userProfile);
                })
                .doOnSuccess(updated -> log.info("User status updated successfully for keycloakId: {}", keycloakId))
                .doOnError(error -> log.error("Error updating user status: {}", error.getMessage()));
    }

    private Mono<Void> validateUserProfile(UserProfile userProfile) {
        return Mono.fromRunnable(() -> {
            if (userProfile.getKeycloakId() == null || userProfile.getKeycloakId().trim().isEmpty()) {
                throw new IllegalArgumentException("Keycloak ID is required");
            }
            if (userProfile.getUsername() == null || userProfile.getUsername().trim().isEmpty()) {
                throw new IllegalArgumentException("Username is required");
            }
            if (userProfile.getEmail() == null || userProfile.getEmail().trim().isEmpty()) {
                throw new IllegalArgumentException("Email is required");
            }
            if (userProfile.getDocumentType() == null) {
                throw new IllegalArgumentException("Document type is required");
            }
            if (userProfile.getDocumentNumber() == null || userProfile.getDocumentNumber().trim().isEmpty()) {
                throw new IllegalArgumentException("Document number is required");
            }
        })
        .then(userProfileRepository.existsByDocumentNumber(userProfile.getDocumentNumber())
                .flatMap(exists -> exists ? 
                    Mono.error(new RuntimeException("Document number already exists")) : 
                    Mono.empty())
        )
        .then(userProfileRepository.existsByEmail(userProfile.getEmail())
                .flatMap(exists -> exists ? 
                    Mono.error(new RuntimeException("Email already exists")) : 
                    Mono.empty())
        )
        .then(userProfileRepository.existsByUsername(userProfile.getUsername())
                .flatMap(exists -> exists ? 
                    Mono.error(new RuntimeException("Username already exists")) : 
                    Mono.empty())
        );
    }
}
