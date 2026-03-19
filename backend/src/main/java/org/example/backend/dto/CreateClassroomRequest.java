package org.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateClassroomRequest(
        @NotBlank(message = "Classroom name is required")
        @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
        String name
) {}
