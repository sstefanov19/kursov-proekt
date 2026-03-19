package org.example.backend.dto;

public record LeaderboardEntry(
        int rank,
        String username,
        int xp,
        int level
) {}
