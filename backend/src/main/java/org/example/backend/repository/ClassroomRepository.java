package org.example.backend.repository;

import org.example.backend.model.Classroom;
import org.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Long> {

    Optional<Classroom> findByCode(String code);

    boolean existsByCode(String code);

    @Query("SELECT c FROM Classroom c JOIN c.members m WHERE m = :user")
    List<Classroom> findAllByMember(User user);
}
