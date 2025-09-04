package pe.edu.vallegrande.vgmsuser.domain.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import pe.edu.vallegrande.vgmsuser.domain.model.enums.DocumentType;
import pe.edu.vallegrande.vgmsuser.domain.model.enums.UserStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "users")
public class UserProfile {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    @NotBlank(message = "Keycloak ID is required")
    private String keycloakId; // ID del usuario en Keycloak
    
    @Indexed(unique = true)
    @NotBlank(message = "Username is required")
    private String username;
    
    @Indexed(unique = true)
    @NotBlank(message = "Email is required")
    private String email;
    
    @NotNull(message = "Document type is required")
    private DocumentType documentType;
    
    @NotBlank(message = "Document number is required")
    @Indexed(unique = true)
    private String documentNumber;
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Phone number format is invalid")
    private String phone;
    
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt;
}
