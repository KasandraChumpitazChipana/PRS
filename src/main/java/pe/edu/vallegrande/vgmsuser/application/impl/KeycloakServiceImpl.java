package pe.edu.vallegrande.vgmsuser.application.impl;

import java.util.List;


import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import jakarta.ws.rs.core.Response;
import pe.edu.vallegrande.vgmsuser.application.service.IKeycloakService;
import pe.edu.vallegrande.vgmsuser.domain.model.User;
import pe.edu.vallegrande.vgmsuser.infraestructure.util.KeycloakProvider;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
public class KeycloakServiceImpl implements IKeycloakService {

    private final KeycloakProvider keycloakProvider;

    @Autowired
    public KeycloakServiceImpl(KeycloakProvider keycloakProvider) {
        this.keycloakProvider = keycloakProvider;
    }

    @Override
    public Mono<List<UserRepresentation>> findAllUsers() {
        return Mono.fromCallable(() -> keycloakProvider.getRealmResource().users().list())
                .subscribeOn(Schedulers.boundedElastic());
    }

    @Override
    public Mono<List<UserRepresentation>> searchUserByUsername(String username) {
        return Mono.fromCallable(() -> keycloakProvider.getRealmResource().users().searchByUsername(username, true))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @Override
    public Mono<String> createUser(@NonNull User userDTO) {
        return Mono.fromCallable(() -> {
            UsersResource usersResource = keycloakProvider.getUserResource();

            // Check if the user already exists
            List<UserRepresentation> existingUsers = usersResource.searchByUsername(userDTO.getUsername(), true);
            if (!existingUsers.isEmpty()) {
                return "El usuario ya existe: " + userDTO.getUsername();
            }

            // Create user representation
            UserRepresentation userRepresentation = new UserRepresentation();
            userRepresentation.setFirstName(userDTO.getFirstname());
            userRepresentation.setLastName(userDTO.getLastname());
            userRepresentation.setEmail(userDTO.getEmail());
            userRepresentation.setUsername(userDTO.getUsername());
            userRepresentation.setEmailVerified(true);
            userRepresentation.setEnabled(true);

            // Create the user
            Response response = usersResource.create(userRepresentation);
            int status = response.getStatus();

            if (status == 201) {
                String path = response.getLocation().getPath();
                String userId = path.substring(path.lastIndexOf('/') + 1);

                // Set password
                UserResource userResource = usersResource.get(userId);
                CredentialRepresentation passwordCred = new CredentialRepresentation();
                passwordCred.setType(CredentialRepresentation.PASSWORD);
                passwordCred.setValue(userDTO.getPassword());
                passwordCred.setTemporary(false);
                userResource.resetPassword(passwordCred);

                // Assign roles
                RealmResource realmResource = keycloakProvider.getRealmResource();
                List<RoleRepresentation> rolesRepresentation;

                if (userDTO.getRoles() == null || userDTO.getRoles().isEmpty()) {
                    // Default role: teacher
                    RoleRepresentation teacherRole = realmResource.roles().get("teacher").toRepresentation();
                    rolesRepresentation = List.of(teacherRole);
                } else {
                    // Assign specified roles
                    rolesRepresentation = realmResource.roles()
                            .list()
                            .stream()
                            .filter(role -> userDTO.getRoles()
                                    .stream()
                                    .anyMatch(roleName -> roleName.equalsIgnoreCase(role.getName())))
                            .toList();
                }

                userResource.roles().realmLevel().add(rolesRepresentation);

                return "Usuario creado exitosamente con ID: " + userId;

            } else if (status == 409) {
                return "El usuario ya existe con ese username o email";
            } else {
                String errorMessage = "";
                if (response.hasEntity()) {
                    errorMessage = response.readEntity(String.class);
                }
                return "Error al crear usuario. Status HTTP: " + status +
                        (errorMessage.isEmpty() ? "" : " - " + errorMessage);
            }

        }).subscribeOn(Schedulers.boundedElastic());
    }

    // eliminado físico por ahora puse eso
    @Override
    public Mono<Void> deleteUser(String userId) {
        return Mono.fromRunnable(() -> keycloakProvider.getUserResource().get(userId).remove())
                .subscribeOn(Schedulers.boundedElastic())
                .then();
    }

    @Override
    public Mono<Void> updateUser(String userId, @NonNull User userDTO) {
        return Mono.fromRunnable(() -> {
            UserRepresentation userRepresentation = new UserRepresentation();
            userRepresentation.setFirstName(userDTO.getFirstname());
            userRepresentation.setLastName(userDTO.getLastname());
            userRepresentation.setEmail(userDTO.getEmail());
            userRepresentation.setUsername(userDTO.getUsername());
            userRepresentation.setEmailVerified(true);

            UserResource userResource = keycloakProvider.getUserResource().get(userId);

            // Solo actualizar contraseña si se proporciona
            if (userDTO.getPassword() != null && !userDTO.getPassword().trim().isEmpty()) {
                CredentialRepresentation passwordCred = new CredentialRepresentation();
                passwordCred.setType(CredentialRepresentation.PASSWORD);
                passwordCred.setValue(userDTO.getPassword());
                passwordCred.setTemporary(false);
                userResource.resetPassword(passwordCred);
            }

            // Actualizar datos básicos del usuario
            userResource.update(userRepresentation);

            // Actualizar roles si se proporcionan
            if (userDTO.getRoles() != null && !userDTO.getRoles().isEmpty()) {
                RealmResource realmResource = keycloakProvider.getRealmResource();

                // Obtener roles actuales del usuario y removerlos
                List<RoleRepresentation> currentRoles = userResource.roles().realmLevel().listAll();
                if (!currentRoles.isEmpty()) {
                    userResource.roles().realmLevel().remove(currentRoles);
                }

                // Asignar nuevos roles
                List<RoleRepresentation> newRoles = realmResource.roles()
                        .list()
                        .stream()
                        .filter(role -> userDTO.getRoles()
                                .stream()
                                .anyMatch(roleName -> roleName.equalsIgnoreCase(role.getName())))
                        .toList();

                if (!newRoles.isEmpty()) {
                    userResource.roles().realmLevel().add(newRoles);
                }
            }

        }).subscribeOn(Schedulers.boundedElastic()).then();
    }

}
