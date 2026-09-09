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
    List<Registration> findByRaceIdAndPaymentStatus(Integer raceId, com.kimbia.backend.enums.PaymentStatus paymentStatus);

    @org.springframework.data.jpa.repository.Query("SELECT r FROM Registration r LEFT JOIN FETCH r.raceResult LEFT JOIN FETCH r.race WHERE r.user.id = :userId")
    List<Registration> findByUserId(@org.springframework.data.repository.query.Param("userId") Integer userId);

    Optional<Registration> findByUserAndRace(User user, Race race);
}

