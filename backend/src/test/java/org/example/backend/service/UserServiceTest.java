package org.example.backend.service;

import org.example.backend.dto.AuthResponse;
import org.example.backend.dto.LoginRequest;
import org.example.backend.dto.RegisterRequest;
import org.example.backend.exception.DuplicateResourceException;
import org.example.backend.exception.InvalidCredentialsException;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.example.backend.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;

    @InjectMocks UserService userService;

    private User existingUser;

    @BeforeEach
    void setUp() {
        existingUser = new User();
        existingUser.setUsername("alice");
        existingUser.setEmail("alice@example.com");
        existingUser.setPassword("hashed");
    }

    @Test
    void register_success_returnsTokenAndUsername() {
        RegisterRequest req = new RegisterRequest("alice@example.com", "alice", "pass123");
        when(userRepository.existsByUsername("alice")).thenReturn(false);
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("pass123")).thenReturn("hashed");
        when(jwtUtil.generateToken("alice")).thenReturn("jwt-token");

        AuthResponse response = userService.register(req);

        assertThat(response.username()).isEqualTo("alice");
        assertThat(response.token()).isEqualTo("jwt-token");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_duplicateUsername_throwsDuplicateResourceException() {
        RegisterRequest req = new RegisterRequest("alice@example.com", "alice", "pass123");
        when(userRepository.existsByUsername("alice")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(req))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Username already taken");
    }

    @Test
    void register_duplicateEmail_throwsDuplicateResourceException() {
        RegisterRequest req = new RegisterRequest("alice@example.com", "alice", "pass123");
        when(userRepository.existsByUsername("alice")).thenReturn(false);
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(req))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email already taken");
    }

    @Test
    void login_success_returnsTokenAndUsername() {
        LoginRequest req = new LoginRequest("alice", "pass123");
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("pass123", "hashed")).thenReturn(true);
        when(jwtUtil.generateToken("alice")).thenReturn("jwt-token");

        AuthResponse response = userService.login(req);

        assertThat(response.username()).isEqualTo("alice");
        assertThat(response.token()).isEqualTo("jwt-token");
    }

    @Test
    void login_userNotFound_throwsInvalidCredentialsException() {
        LoginRequest req = new LoginRequest("unknown", "pass123");
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.login(req))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void login_wrongPassword_throwsInvalidCredentialsException() {
        LoginRequest req = new LoginRequest("alice", "wrongpass");
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("wrongpass", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> userService.login(req))
                .isInstanceOf(InvalidCredentialsException.class);
    }
}
