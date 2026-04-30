package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.LeaderboardEntry;
import org.example.backend.dto.LeaderboardPage;
import org.example.backend.dto.PlayerStats;
import org.example.backend.exception.InvalidPerkException;
import org.example.backend.exception.PerkRequirementNotMetException;
import org.example.backend.exception.UserNotFoundException;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class PlayerService {

    private static final int PAGE_SIZE = 20;
    private final UserRepository userRepository;

    // Perk name -> minimum level required
    private static final Map<String, Integer> PERK_REQUIREMENTS = Map.of(
            "hint", 3,
            "shield", 5,
            "double_xp", 10,
            "skip", 15,
            "triple_xp", 20
    );

    /**
     * XP required per level, doubling every 5 levels:
     * Levels 1-5: 100 XP each, Levels 6-10: 200 XP each,
     * Levels 11-15: 400 XP each, Levels 16-20: 800 XP each, etc.
     */
    public static int xpRequiredForLevel(int level) {
        int tier = (level - 1) / 5; // 0 for levels 1-5, 1 for 6-10, etc.
        return 100 * (1 << tier);   // 100, 200, 400, 800, ...
    }

    public static int totalXpForLevel(int level) {
        int total = 0;
        for (int l = 1; l < level; l++) {
            total += xpRequiredForLevel(l);
        }
        return total;
    }

    public static int calculateLevel(int xp) {
        int level = 1;
        int remaining = xp;
        while (remaining >= xpRequiredForLevel(level)) {
            remaining -= xpRequiredForLevel(level);
            level++;
        }
        return level;
    }

    public PlayerStats addXp(String username, int xpToAdd) {
        User user = getUserOrThrow(username);

        user.setXp(user.getXp() + xpToAdd);
        user.setLevel(calculateLevel(user.getXp()));
        userRepository.save(user);

        return toStats(user);
    }

    public PlayerStats getStats(String username) {
        User user = getUserOrThrow(username);
        return toStats(user);
    }

    public PlayerStats recordGamePlayed(String username) {
        User user = getUserOrThrow(username);
        updateStreak(user, LocalDate.now());
        userRepository.save(user);
        return toStats(user);
    }

    public PlayerStats equipPerk(String username, String perk) {
        User user = getUserOrThrow(username);

        if (perk == null || perk.isBlank()) {
            // Unequip
            user.setActivePerk(null);
            userRepository.save(user);
            return toStats(user);
        }

        if (!PERK_REQUIREMENTS.containsKey(perk)) {
            throw new InvalidPerkException("Unknown perk: " + perk);
        }

        int requiredLevel = PERK_REQUIREMENTS.get(perk);
        if (user.getLevel() < requiredLevel) {
            throw new PerkRequirementNotMetException(
                    "You need level " + requiredLevel + " to unlock this perk"
            );
        }

        user.setActivePerk(perk);
        userRepository.save(user);
        return toStats(user);
    }

    public Set<String> getAvailablePerks() {
        return PERK_REQUIREMENTS.keySet();
    }

    public LeaderboardPage getLeaderboard(int page) {
        Page<User> userPage = userRepository.findAllByOrderByXpDesc(PageRequest.of(page, PAGE_SIZE));
        AtomicInteger position = new AtomicInteger(page * PAGE_SIZE + 1);

        var entries = userPage.getContent().stream()
                .map(u -> new LeaderboardEntry(
                        position.getAndIncrement(),
                        u.getUsername(),
                        u.getXp(),
                        calculateLevel(u.getXp())
                ))
                .toList();

        return new LeaderboardPage(entries, page, userPage.getTotalPages(), userPage.getTotalElements());
    }

    private User getUserOrThrow(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private void updateStreak(User user, LocalDate today) {
        LocalDate lastPlayedDate = user.getLastPlayedDate();

        if (today.equals(lastPlayedDate)) {
            return;
        }

        if (today.minusDays(1).equals(lastPlayedDate)) {
            user.setStreakCount(user.getStreakCount() + 1);
        } else {
            user.setStreakCount(1);
        }

        user.setLastPlayedDate(today);
    }

    private PlayerStats toStats(User user) {
        int rank = userRepository.findRankByXp(user.getXp());
        return new PlayerStats(
                user.getUsername(),
                user.getXp(),
                user.getLevel(),
                rank,
                user.getActivePerk(),
                user.getStreakCount()
        );
    }
}
