package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.ClassroomResponse;
import org.example.backend.dto.LeaderboardEntry;
import org.example.backend.dto.LeaderboardPage;
import org.example.backend.exception.ClassroomNotFoundException;
import org.example.backend.exception.UserNotFoundException;
import org.example.backend.model.Classroom;
import org.example.backend.model.User;
import org.example.backend.repository.ClassroomRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class ClassroomService {

    private static final int PAGE_SIZE = 20;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;

    public ClassroomResponse create(String username, String name) {
        User user = getUserOrThrow(username);

        Classroom classroom = new Classroom();
        classroom.setName(name);
        classroom.setCode(generateCode());
        classroom.setCreatedBy(user);
        classroom.getMembers().add(user);

        classroomRepository.save(classroom);
        return toResponse(classroom);
    }

    public ClassroomResponse join(String username, String code) {
        User user = getUserOrThrow(username);
        Classroom classroom = getClassroomByCodeOrThrow(code);

        classroom.getMembers().add(user);
        classroomRepository.save(classroom);
        return toResponse(classroom);
    }

    public void leave(String username, Long classroomId) {
        User user = getUserOrThrow(username);
        Classroom classroom = getClassroomByIdOrThrow(classroomId);

        classroom.getMembers().remove(user);
        classroomRepository.save(classroom);
    }

    public List<ClassroomResponse> getMyClassrooms(String username) {
        User user = getUserOrThrow(username);

        return classroomRepository.findAllByMember(user).stream()
                .map(this::toResponse)
                .toList();
    }

    public LeaderboardPage getClassroomLeaderboard(String code, int page) {
        Classroom classroom = getClassroomByCodeOrThrow(code);

        List<User> sorted = classroom.getMembers().stream()
                .sorted(Comparator.comparingInt(User::getXp).reversed())
                .toList();

        int total = sorted.size();
        int totalPages = (int) Math.ceil((double) total / PAGE_SIZE);
        int from = page * PAGE_SIZE;
        int to = Math.min(from + PAGE_SIZE, total);

        if (from >= total) {
            return new LeaderboardPage(List.of(), page, totalPages, total);
        }

        AtomicInteger position = new AtomicInteger(from + 1);
        var entries = sorted.subList(from, to).stream()
                .map(u -> new LeaderboardEntry(
                        position.getAndIncrement(),
                        u.getUsername(),
                        u.getXp(),
                        u.getXp() / 100 + 1
                ))
                .toList();

        return new LeaderboardPage(entries, page, totalPages, total);
    }

    private String generateCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        } while (classroomRepository.existsByCode(code));
        return code;
    }

    private User getUserOrThrow(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private Classroom getClassroomByCodeOrThrow(String code) {
        return classroomRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ClassroomNotFoundException("Classroom not found"));
    }

    private Classroom getClassroomByIdOrThrow(Long classroomId) {
        return classroomRepository.findById(classroomId)
                .orElseThrow(() -> new ClassroomNotFoundException("Classroom not found"));
    }

    private ClassroomResponse toResponse(Classroom c) {
        return new ClassroomResponse(
                c.getId(),
                c.getName(),
                c.getCode(),
                c.getCreatedBy().getUsername(),
                c.getMembers().size()
        );
    }
}
