package com.kimbia.backend.repository;

import com.kimbia.backend.entity.RaceResult;
import com.kimbia.backend.enums.ModerationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RaceResultRepository extends JpaRepository<RaceResult, Integer> {

    Optional<RaceResult> findByRegistrationId(Integer registrationId);

    boolean existsByRegistrationId(Integer registrationId);

    @Query("SELECT r FROM RaceResult r WHERE r.registration.race.id = :raceId")
    List<RaceResult> findByRaceId(@Param("raceId") Integer raceId);

    @Query("SELECT r FROM RaceResult r WHERE r.registration.race.id = :raceId AND r.moderationStatus = :status")
    List<RaceResult> findByRaceIdAndModerationStatus(@Param("raceId") Integer raceId, @Param("status") ModerationStatus status);
}
