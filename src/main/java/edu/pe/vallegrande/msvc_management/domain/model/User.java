package edu.pe.vallegrande.msvc_management.domain.model;

import lombok.Data;

@Data
public class User {
    private Long id;
    private String firstName;
    private String lastName;
    private String documentType;
    private String documentNumber;
    private String email;
    private String password;
    private String userImageBase64;
    private String role;
    private Character status;
}