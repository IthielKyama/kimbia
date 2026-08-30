package com.kimbia.backend.repository;

import com.kimbia.backend.entity.Race;
import com.kimbia.backend.enums.RaceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RaceRepository extends JpaRepository<Race, Integer> {
    List<Race> findByStatus(RaceStatus status);
}
