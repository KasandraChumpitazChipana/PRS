package pe.edu.vallegrande.vgmsuser.infraestructure.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import pe.edu.vallegrande.vgmsuser.domain.model.UserProfile;
import pe.edu.vallegrande.vgmsuser.domain.model.enums.UserStatus;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface UserProfileRepository extends ReactiveMongoRepository<UserProfile, String> {
    
    Mono<UserProfile> findByKeycloakId(String keycloakId);
    
    Mono<UserProfile> findByUsername(String username);
    
    Mono<UserProfile> findByEmail(String email);
    
    Mono<UserProfile> findByDocumentNumber(String documentNumber);
    
    Flux<UserProfile> findByStatus(UserStatus status);
    
    Mono<Boolean> existsByDocumentNumber(String documentNumber);
    
    Mono<Boolean> existsByEmail(String email);
    
    Mono<Boolean> existsByUsername(String username);
    
    Mono<Boolean> existsByKeycloakId(String keycloakId);
}
