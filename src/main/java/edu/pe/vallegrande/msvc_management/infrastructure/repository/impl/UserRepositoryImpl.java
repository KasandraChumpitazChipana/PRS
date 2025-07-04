// UserRepositoryImpl.java - CORREGIDO
package edu.pe.vallegrande.msvc_management.infrastructure.repository.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Repository;
import edu.pe.vallegrande.msvc_management.domain.model.User;
import edu.pe.vallegrande.msvc_management.infrastructure.repository.UserRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import io.r2dbc.spi.Row;
import io.r2dbc.spi.RowMetadata;

@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository {

    private final DatabaseClient client;

    @Override
    public Flux<User> findAll() {
        return client.sql("SELECT * FROM users WHERE status = 'A'")
                .map(this::mapRowToUser)  // ✅ Ahora funciona correctamente
                .all();
    }

    @Override
    public Mono<User> findById(Long id) {
        return client.sql("SELECT * FROM users WHERE id = :id")
                .bind("id", id)
                .map(this::mapRowToUser)  // ✅ Ahora funciona correctamente
                .one();
    }
    @Override
    public Flux<User> findByStatus(Character status) {
        return client.sql("SELECT * FROM users WHERE status = :status")
                .bind("status", status)
                .map(this::mapRowToUser)
                .all();
    }
    @Override
    public Flux<User> findByRole(String role) {
        return client.sql("SELECT * FROM users WHERE role = :role")
                .bind("role", role)
                .map(this::mapRowToUser)
                .all();
    }


    @Override
    public Mono<User> save(User user) {
        if (user.getId() == null) {
            // INSERT para nuevo usuario
            return client.sql("""
                    INSERT INTO users (first_name, last_name, document_type, document_number, 
                                     email, password, user_image, role, status) 
                    VALUES (:firstName, :lastName, :documentType, :documentNumber, 
                           :email, :password, :userImage, :role, :status)
                    RETURNING id
                    """)
                    .bind("firstName", user.getFirstName())
                    .bind("lastName", user.getLastName())
                    .bind("documentType", user.getDocumentType())
                    .bind("documentNumber", user.getDocumentNumber())
                    .bind("email", user.getEmail())
                    .bind("password", user.getPassword())
                    .bind("userImage", user.getUserImageBase64())
                    .bind("role", user.getRole())
                    .bind("status", user.getStatus())
                    .map((row, metadata) -> {
                        Long generatedId = row.get("id", Long.class);
                        user.setId(generatedId);
                        return user;
                    })
                    .one();
        } else {
            // UPDATE para usuario existente
            return client.sql("""
                    UPDATE users SET first_name = :firstName, last_name = :lastName, 
                                   document_type = :documentType, document_number = :documentNumber,
                                   email = :email, password = :password, user_image = :userImage,
                                   role = :role, status = :status
                    WHERE id = :id
                    """)
                    .bind("id", user.getId())
                    .bind("firstName", user.getFirstName())
                    .bind("lastName", user.getLastName())
                    .bind("documentType", user.getDocumentType())
                    .bind("documentNumber", user.getDocumentNumber())
                    .bind("email", user.getEmail())
                    .bind("password", user.getPassword())
                    .bind("userImage", user.getUserImageBase64())
                    .bind("role", user.getRole())
                    .bind("status", user.getStatus())
                    .fetch()
                    .rowsUpdated()
                    .thenReturn(user);
        }
    }

     @Override
    public Flux<User> findInactive() {
        return client
            .sql("SELECT * FROM users WHERE status = 'I'")
            .map(this::mapRowToUser)
            .all();
    }
    
    // Método para eliminar (cambiar status a 'I')
  @Override
    public Mono<Void> delete(Long id) {
        return client.sql("UPDATE users SET status = 'I' WHERE id = :id")
                .bind("id", id)
                .fetch()
                .rowsUpdated()
                .flatMap(rows -> {
                    if (rows > 0) {
                        return Mono.empty();
                    } else {
                        return Mono.error(new RuntimeException("No se encontró el usuario con id: " + id));
                    }
                });
    }

    // Método para restaurar (cambiar status a 'A')
    public Mono<User> restore(Long id) {
        return client.sql("UPDATE users SET status = 'A' WHERE id = :id")
                .bind("id", id)
                .fetch()
                .rowsUpdated()
                .then(findById(id));
    }

    // ✅ CORRECCIÓN: Cambiar la firma del método para usar BiFunction
    private User mapRowToUser(Row row, RowMetadata metadata) {
        User user = new User();
        user.setId(row.get("id", Long.class));
        user.setFirstName(row.get("first_name", String.class));
        user.setLastName(row.get("last_name", String.class));
        user.setDocumentType(row.get("document_type", String.class));
        user.setDocumentNumber(row.get("document_number", String.class));
        user.setEmail(row.get("email", String.class));
        user.setPassword(row.get("password", String.class));
        user.setUserImageBase64(row.get("user_image", String.class));
        user.setRole(row.get("role", String.class));
        user.setStatus(row.get("status", Character.class));
        return user;
    }
}