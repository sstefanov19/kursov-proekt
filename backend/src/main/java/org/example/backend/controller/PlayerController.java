package org.example.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.AddXpRequest;
import org.example.backend.dto.EquipPerkRequest;
import org.example.backend.dto.LeaderboardPage;
import org.example.backend.dto.PlayerStats;
import org.example.backend.service.PlayerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/player")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;

    @PostMapping("/xp")
    public ResponseEntity<PlayerStats> addXp(Authentication auth, @Valid @RequestBody AddXpRequest request) {
        String username = auth.getName();
        PlayerStats stats = playerService.addXp(username, request.xp());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/me")
    public ResponseEntity<PlayerStats> getMyStats(Authentication auth) {
        String username = auth.getName();
        PlayerStats stats = playerService.getStats(username);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/game-played")
    public ResponseEntity<PlayerStats> recordGamePlayed(Authentication auth) {
        return ResponseEntity.ok(playerService.recordGamePlayed(auth.getName()));
    }

    @PostMapping("/perk")
    public ResponseEntity<PlayerStats> equipPerk(Authentication auth, @RequestBody EquipPerkRequest request) {
        return ResponseEntity.ok(playerService.equipPerk(auth.getName(), request.perk()));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<LeaderboardPage> getLeaderboard(@RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(playerService.getLeaderboard(page));
    }
}
