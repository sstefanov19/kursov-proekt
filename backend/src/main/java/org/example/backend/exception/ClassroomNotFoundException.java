package org.example.backend.exception;

public class ClassroomNotFoundException extends RuntimeException {

    public ClassroomNotFoundException(String message) {
        super(message);
    }
}
