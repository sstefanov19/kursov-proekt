package org.example.backend.exception;

import java.time.Instant;
import java.util.Map;

public record ApiErrorResponse(
        Instant timestamp,
        String code,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors
) {

    public static ApiErrorResponse of(String code, int status, String error, String message, String path) {
        return new ApiErrorResponse(Instant.now(), code, status, error, message, path, Map.of());
    }

    public static ApiErrorResponse of(
            String code,
            int status,
            String error,
            String message,
            String path,
            Map<String, String> fieldErrors
    ) {
        return new ApiErrorResponse(Instant.now(), code, status, error, message, path, fieldErrors);
    }
}
