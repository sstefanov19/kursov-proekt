package org.example.backend.dto;

import java.util.List;

public record LeaderboardPage(
        List<LeaderboardEntry> entries,
        int page,
        int totalPages,
        long totalUsers
) {}
