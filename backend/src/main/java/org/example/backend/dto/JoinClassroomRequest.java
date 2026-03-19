package org.example.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record JoinClassroomRequest(
        @NotBlank(message = "Classroom code is required")
        String code
) {}
