package org.example.backend.dto;

public record PlayerStats(
        String username,
        int xp,
        int level,
        int rank,
        String activePerk
) {}
