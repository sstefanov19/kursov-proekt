package org.example.backend.service;

import org.example.backend.dto.PlayerStats;
import org.example.backend.exception.InvalidPerkException;
import org.example.backend.exception.PerkRequirementNotMetException;
import org.example.backend.exception.UserNotFoundException;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PlayerServiceTest {

    @Mock UserRepository userRepository;

    @InjectMocks PlayerService playerService;

    // --- Pure-Java level math (no Spring context needed) ---

    @Test
    void xpRequiredForLevel_tiersDoubleEveryFiveLevels() {
        assertThat(PlayerService.xpRequiredForLevel(1)).isEqualTo(100);
        assertThat(PlayerService.xpRequiredForLevel(5)).isEqualTo(100);
        assertThat(PlayerService.xpRequiredForLevel(6)).isEqualTo(200);
        assertThat(PlayerService.xpRequiredForLevel(11)).isEqualTo(400);
        assertThat(PlayerService.xpRequiredForLevel(16)).isEqualTo(800);
    }

    @Test
    void calculateLevel_returnsCorrectLevelForXpBoundaries() {
        assertThat(PlayerService.calculateLevel(0)).isEqualTo(1);
        assertThat(PlayerService.calculateLevel(99)).isEqualTo(1);
        assertThat(PlayerService.calculateLevel(100)).isEqualTo(2);
        assertThat(PlayerService.calculateLevel(499)).isEqualTo(5);
        assertThat(PlayerService.calculateLevel(500)).isEqualTo(6);
    }

    // --- addXp ---

    @Test
    void addXp_updatesUserXpAndRecalculatesLevel() {
        User user = makeUser("alice", 0, 1);
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));
        when(userRepository.findRankByXp(anyInt())).thenReturn(1);

        PlayerStats stats = playerService.addXp("alice", 200);

        assertThat(stats.xp()).isEqualTo(200);
        assertThat(stats.level()).isEqualTo(PlayerService.calculateLevel(200));
        verify(userRepository).save(user);
    }

    // --- equipPerk ---

    @Test
    void equipPerk_validPerkSufficientLevel_equipsSuccessfully() {
        User user = makeUser("alice", 0, 5); // "shield" requires level 5
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));
        when(userRepository.findRankByXp(anyInt())).thenReturn(1);

        PlayerStats stats = playerService.equipPerk("alice", "shield");

        assertThat(stats.activePerk()).isEqualTo("shield");
        verify(userRepository).save(user);
    }

    @Test
    void equipPerk_levelTooLow_throwsPerkRequirementNotMetException() {
        User user = makeUser("alice", 0, 2); // shield requires level 5
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> playerService.equipPerk("alice", "shield"))
                .isInstanceOf(PerkRequirementNotMetException.class)
                .hasMessageContaining("level 5");
    }

    @Test
    void equipPerk_unknownPerk_throwsInvalidPerkException() {
        User user = makeUser("alice", 0, 99);
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> playerService.equipPerk("alice", "godmode"))
                .isInstanceOf(InvalidPerkException.class);
    }

    @Test
    void equipPerk_nullPerk_unequipsActivePerk() {
        User user = makeUser("alice", 0, 10);
        user.setActivePerk("hint");
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));
        when(userRepository.findRankByXp(anyInt())).thenReturn(1);

        PlayerStats stats = playerService.equipPerk("alice", null);

        assertThat(stats.activePerk()).isNull();
    }

    // --- getStats ---

    @Test
    void getStats_userNotFound_throwsUserNotFoundException() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> playerService.getStats("ghost"))
                .isInstanceOf(UserNotFoundException.class);
    }

    // --- helpers ---

    private User makeUser(String username, int xp, int level) {
        User u = new User();
        u.setUsername(username);
        u.setEmail(username + "@example.com");
        u.setPassword("hashed");
        u.setXp(xp);
        u.setLevel(level);
        return u;
    }
}
