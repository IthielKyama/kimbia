package com.kimbia.backend.repository;

import com.kimbia.backend.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Integer> {
    List<Registration> findByRaceId(Integer raceId);
}

