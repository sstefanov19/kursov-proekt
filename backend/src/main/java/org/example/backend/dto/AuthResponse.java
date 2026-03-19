package org.example.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthResponse(
        @NotBlank String token,
        @NotBlank String username
) {}
