package com.kimbia.backend.repository;

import com.kimbia.backend.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import com.kimbia.backend.entity.Race;
import com.kimbia.backend.entity.User;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Integer> {
    List<Registration> findByRaceId(Integer raceId);
    List<Registration> findByUserId(Integer userId);
    Optional<Registration> findByUserAndRace(User user, Race race);
}

