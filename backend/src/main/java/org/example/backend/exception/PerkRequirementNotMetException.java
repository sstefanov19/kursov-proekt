package org.example.backend.exception;

public class PerkRequirementNotMetException extends RuntimeException {

    public PerkRequirementNotMetException(String message) {
        super(message);
    }
}
