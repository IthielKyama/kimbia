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

    @Query("SELECT r FROM RaceResult r WHERE r.registration.id = :registrationId")
    Optional<RaceResult> findByRegistrationId(@Param("registrationId") Integer registrationId);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM RaceResult r WHERE r.registration.id = :registrationId")
    boolean existsByRegistrationId(@Param("registrationId") Integer registrationId);

    @Query("SELECT r FROM RaceResult r WHERE r.registration.race.id = :raceId")
    List<RaceResult> findByRaceId(@Param("raceId") Integer raceId);

    @Query("SELECT r FROM RaceResult r WHERE r.registration.race.id = :raceId AND r.moderationStatus = :status")
    List<RaceResult> findByRaceIdAndModerationStatus(@Param("raceId") Integer raceId, @Param("status") ModerationStatus status);
}
