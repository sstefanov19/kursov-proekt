package org.example.backend.service;

import org.example.backend.dto.ClassroomResponse;
import org.example.backend.dto.LeaderboardPage;
import org.example.backend.exception.ClassroomNotFoundException;
import org.example.backend.exception.UserNotFoundException;
import org.example.backend.model.Classroom;
import org.example.backend.model.User;
import org.example.backend.repository.ClassroomRepository;
import org.example.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClassroomServiceTest {

    @Mock ClassroomRepository classroomRepository;
    @Mock UserRepository userRepository;

    @InjectMocks ClassroomService classroomService;

    private User teacher;

    @BeforeEach
    void setUp() {
        teacher = new User();
        teacher.setUsername("teacher");
        teacher.setEmail("teacher@school.com");
        teacher.setPassword("hashed");
    }

    @Test
    void create_success_creatorIsAutoAddedAsMember() {
        when(userRepository.findByUsername("teacher")).thenReturn(Optional.of(teacher));
        when(classroomRepository.existsByCode(anyString())).thenReturn(false);

        ClassroomResponse response = classroomService.create("teacher", "Math 101");

        assertThat(response.name()).isEqualTo("Math 101");
        assertThat(response.createdBy()).isEqualTo("teacher");
        assertThat(response.memberCount()).isEqualTo(1);
        verify(classroomRepository).save(any(Classroom.class));
    }

    @Test
    void create_userNotFound_throwsUserNotFoundException() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> classroomService.create("ghost", "Test"))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void join_success_incrementsMemberCount() {
        Classroom classroom = new Classroom();
        classroom.setName("Science");
        classroom.setCode("ABC123");
        classroom.setCreatedBy(teacher);
        classroom.getMembers().add(teacher);

        User student = new User();
        student.setUsername("student");
        student.setEmail("student@school.com");
        student.setPassword("hashed");

        when(userRepository.findByUsername("student")).thenReturn(Optional.of(student));
        when(classroomRepository.findByCode("ABC123")).thenReturn(Optional.of(classroom));

        ClassroomResponse response = classroomService.join("student", "ABC123");

        assertThat(response.memberCount()).isEqualTo(2);
        verify(classroomRepository).save(classroom);
    }

    @Test
    void join_classroomNotFound_throwsClassroomNotFoundException() {
        when(userRepository.findByUsername("teacher")).thenReturn(Optional.of(teacher));
        when(classroomRepository.findByCode("BADCOD")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> classroomService.join("teacher", "BADCOD"))
                .isInstanceOf(ClassroomNotFoundException.class);
    }

    @Test
    void getLeaderboard_emptyClassroom_returnsEmptyPage() {
        Classroom classroom = new Classroom();
        classroom.setName("Empty");
        classroom.setCode("EMPTY1");
        classroom.setCreatedBy(teacher);

        when(classroomRepository.findByCode("EMPTY1")).thenReturn(Optional.of(classroom));

        LeaderboardPage page = classroomService.getClassroomLeaderboard("EMPTY1", 0);

        assertThat(page.entries()).isEmpty();
        assertThat(page.totalUsers()).isEqualTo(0);
    }

    @Test
    void getLeaderboard_membersRankedByXpDescending() {
        User high = makeUser("high", 500);
        User low = makeUser("low", 100);

        Classroom classroom = new Classroom();
        classroom.setName("Class");
        classroom.setCode("CODE01");
        classroom.setCreatedBy(teacher);
        classroom.getMembers().add(low);
        classroom.getMembers().add(high);

        when(classroomRepository.findByCode("CODE01")).thenReturn(Optional.of(classroom));

        LeaderboardPage page = classroomService.getClassroomLeaderboard("CODE01", 0);

        assertThat(page.entries()).hasSize(2);
        assertThat(page.entries().get(0).username()).isEqualTo("high");
        assertThat(page.entries().get(1).username()).isEqualTo("low");
    }

    private User makeUser(String username, int xp) {
        User u = new User();
        u.setUsername(username);
        u.setEmail(username + "@school.com");
        u.setPassword("hashed");
        u.setXp(xp);
        u.setLevel(PlayerService.calculateLevel(xp));
        return u;
    }
}
