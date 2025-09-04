package pe.edu.vallegrande.vgmsuser.application.service;

import pe.edu.vallegrande.vgmsuser.domain.model.UserProfile;
import pe.edu.vallegrande.vgmsuser.domain.model.enums.UserStatus;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface IUserProfileService {
    
    Mono<UserProfile> createUserProfile(UserProfile userProfile);
    
    Mono<UserProfile> updateUserProfile(String keycloakId, UserProfile userProfile);
    
    Mono<UserProfile> findByKeycloakId(String keycloakId);
    
    Mono<UserProfile> findByUsername(String username);
    
    Mono<UserProfile> findByEmail(String email);
    
    Mono<UserProfile> findByDocumentNumber(String documentNumber);
    
    Flux<UserProfile> findByStatus(UserStatus status);
    
    Flux<UserProfile> findAllUserProfiles();
    
    Mono<Void> deleteUserProfile(String keycloakId);
    
    Mono<UserProfile> updateUserStatus(String keycloakId, UserStatus status);
}
