package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.LeaderboardEntry;
import org.example.backend.dto.LeaderboardPage;
import org.example.backend.dto.PlayerStats;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class PlayerService {

    private static final int PAGE_SIZE = 20;
    private final UserRepository userRepository;

    public PlayerStats addXp(String username, int xpToAdd) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setXp(user.getXp() + xpToAdd);
        user.setLevel(user.getXp() / 100 + 1);
        userRepository.save(user);

        int rank = userRepository.findRankByXp(user.getXp());
        return new PlayerStats(user.getUsername(), user.getXp(), user.getLevel(), rank);
    }

    public PlayerStats getStats(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int rank = userRepository.findRankByXp(user.getXp());
        return new PlayerStats(user.getUsername(), user.getXp(), user.getLevel(), rank);
    }

    public LeaderboardPage getLeaderboard(int page) {
        Page<User> userPage = userRepository.findAllByOrderByXpDesc(PageRequest.of(page, PAGE_SIZE));
        AtomicInteger position = new AtomicInteger(page * PAGE_SIZE + 1);

        var entries = userPage.getContent().stream()
                .map(u -> new LeaderboardEntry(
                        position.getAndIncrement(),
                        u.getUsername(),
                        u.getXp(),
                        u.getXp() / 100 + 1
                ))
                .toList();

        return new LeaderboardPage(entries, page, userPage.getTotalPages(), userPage.getTotalElements());
    }
}
