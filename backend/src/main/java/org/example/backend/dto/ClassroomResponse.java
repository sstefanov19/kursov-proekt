package org.example.backend.dto;

public record ClassroomResponse(
        Long id,
        String name,
        String code,
        String createdBy,
        int memberCount
) {}
