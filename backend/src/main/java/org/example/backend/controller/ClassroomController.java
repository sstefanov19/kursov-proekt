package org.example.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.*;
import org.example.backend.service.ClassroomService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/classrooms")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassroomService classroomService;

    @PostMapping
    public ResponseEntity<ClassroomResponse> create(
            Authentication auth,
            @Valid @RequestBody CreateClassroomRequest request) {
        return ResponseEntity.ok(classroomService.create(auth.getName(), request.name()));
    }

    @PostMapping("/join")
    public ResponseEntity<ClassroomResponse> join(
            Authentication auth,
            @Valid @RequestBody JoinClassroomRequest request) {
        return ResponseEntity.ok(classroomService.join(auth.getName(), request.code()));
    }

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<Void> leave(Authentication auth, @PathVariable Long id) {
        classroomService.leave(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ClassroomResponse>> getMyClassrooms(Authentication auth) {
        return ResponseEntity.ok(classroomService.getMyClassrooms(auth.getName()));
    }

    @GetMapping("/{code}/leaderboard")
    public ResponseEntity<LeaderboardPage> getClassroomLeaderboard(
            @PathVariable String code,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(classroomService.getClassroomLeaderboard(code, page));
    }
}
