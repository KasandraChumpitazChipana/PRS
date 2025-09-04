package pe.edu.vallegrande.vgmsuser.infraestructure.rest;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.vallegrande.vgmsuser.application.service.IUserManagementService;
import pe.edu.vallegrande.vgmsuser.domain.model.User;
import pe.edu.vallegrande.vgmsuser.domain.model.UserProfile;
import pe.edu.vallegrande.vgmsuser.domain.model.enums.UserStatus;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;

@Slf4j
@RestController
@RequestMapping("/api/v1/user-management")
@RequiredArgsConstructor
public class UserManagementRest {

    private final IUserManagementService userManagementService;

    @PostMapping("/users")
    public Mono<ResponseEntity<String>> createCompleteUser(@Valid @RequestBody User user) {
        log.info("Creating complete user with username: {}", user.getUsername());
        
        return userManagementService.createCompleteUser(user)
                .map(response -> {
                    try {
                        if (response.contains("exitosamente")) {
                            return ResponseEntity.created(new URI("/api/v1/user-management/users/"))
                                    .body(response);
                        } else {
                            return ResponseEntity.badRequest().body(response);
                        }
                    } catch (URISyntaxException e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Error creating URI: " + e.getMessage());
                    }
                })
                .onErrorResume(error -> {
                    log.error("Error creating complete user: {}", error.getMessage());
                    return Mono.just(ResponseEntity.badRequest().body("Error: " + error.getMessage()));
                });
    }

    @GetMapping("/users")
    public Flux<UserProfile> getAllCompleteUsers() {
        log.info("Getting all complete users");
        
        return userManagementService.getAllCompleteUsers()
                .doOnError(error -> log.error("Error getting all users: {}", error.getMessage()));
    }

    @GetMapping("/users/keycloak/{keycloakId}")
    public Mono<ResponseEntity<UserProfile>> getCompleteUserByKeycloakId(@PathVariable String keycloakId) {
        log.info("Getting complete user by keycloakId: {}", keycloakId);
        
        return userManagementService.getCompleteUserByKeycloakId(keycloakId)
                .map(ResponseEntity::ok)
                .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()))
                .onErrorResume(error -> {
                    log.error("Error getting user by keycloakId: {}", error.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
                });
    }

    @GetMapping("/users/username/{username}")
    public Mono<ResponseEntity<UserProfile>> getCompleteUserByUsername(@PathVariable String username) {
        log.info("Getting complete user by username: {}", username);
        
        return userManagementService.getCompleteUserByUsername(username)
                .map(ResponseEntity::ok)
                .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()))
                .onErrorResume(error -> {
                    log.error("Error getting user by username: {}", error.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
                });
    }

    @PutMapping("/users/{keycloakId}")
    public Mono<ResponseEntity<String>> updateCompleteUser(
            @PathVariable String keycloakId, 
            @Valid @RequestBody User user) {
        log.info("Updating complete user with keycloakId: {}", keycloakId);
        
        return userManagementService.updateCompleteUser(keycloakId, user)
                .map(response -> ResponseEntity.ok().body(response))
                .onErrorResume(error -> {
                    log.error("Error updating user: {}", error.getMessage());
                    return Mono.just(ResponseEntity.badRequest().body("Error: " + error.getMessage()));
                });
    }

    @DeleteMapping("/users/{keycloakId}")
    public Mono<ResponseEntity<String>> deleteCompleteUser(@PathVariable String keycloakId) {
        log.info("Deleting complete user with keycloakId: {}", keycloakId);
        
        return userManagementService.deleteCompleteUser(keycloakId)
                .map(response -> ResponseEntity.ok().body(response))
                .onErrorResume(error -> {
                    log.error("Error deleting user: {}", error.getMessage());
                    return Mono.just(ResponseEntity.badRequest().body("Error: " + error.getMessage()));
                });
    }

    @PatchMapping("/users/{keycloakId}/status")
    public Mono<ResponseEntity<UserProfile>> changeUserStatus(
            @PathVariable String keycloakId, 
            @RequestParam UserStatus status) {
        log.info("Changing user status to {} for keycloakId: {}", status, keycloakId);
        
        return userManagementService.changeUserStatus(keycloakId, status)
                .map(ResponseEntity::ok)
                .onErrorResume(error -> {
                    log.error("Error changing user status: {}", error.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
                });
    }

    @GetMapping("/users/status/{status}")
    public Flux<UserProfile> getUsersByStatus(@PathVariable UserStatus status) {
        log.info("Getting users by status: {}", status);
        
        return userManagementService.getUsersByStatus(status)
                .doOnError(error -> log.error("Error getting users by status: {}", error.getMessage()));
    }
}
