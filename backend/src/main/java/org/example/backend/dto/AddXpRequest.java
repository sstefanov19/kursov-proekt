package org.example.backend.dto;

import jakarta.validation.constraints.Min;

public record AddXpRequest(
        @Min(value = 1, message = "XP must be at least 1")
        int xp
) {}
