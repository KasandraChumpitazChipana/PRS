package edu.pe.vallegrande.msvc_management.infrastructure.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String documentType;
    private String documentNumber;
    private String email;
    private String role;
    private Character status;
    private String userImageBase64;
}