package com.kimbia.backend.repository;

import com.kimbia.backend.entity.Race;
import com.kimbia.backend.enums.RaceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RaceRepository extends JpaRepository<Race, Integer> {
    List<Race> findByStatus(RaceStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT r FROM Race r WHERE r.organizer.id = :organizerId ORDER BY r.createdAt DESC")
    List<Race> findByOrganizerIdOrderByCreatedAtDesc(@org.springframework.data.repository.query.Param("organizerId") Integer organizerId);

    List<Race> findAllByOrderByCreatedAtDesc();
}
