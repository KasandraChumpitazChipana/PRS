package edu.pe.vallegrande.msvc_management.domain.enums;

public enum Status {
    ACTIVE('A'),
    INACTIVE('I');

    private final char value;

    Status(char value) {
        this.value = value;
    }

    public char getValue() {
        return value;
    }
}
