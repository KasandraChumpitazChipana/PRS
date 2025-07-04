package edu.pe.vallegrande.msvc_management.infrastructure.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UserRequest {
    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    private String documentType;
    private String documentNumber;

    @NotBlank
    @Email
    private String email;

    private String password;
    private String role;
    private Character status;
    private String userImageBase64;
}
