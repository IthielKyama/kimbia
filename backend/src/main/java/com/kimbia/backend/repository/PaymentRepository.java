package com.kimbia.backend.repository;

import com.kimbia.backend.entity.Payment;
import com.kimbia.backend.enums.AwardType;
import com.kimbia.backend.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    Optional<Payment> findByTransactionRef(String transactionRef);

    @Query("SELECT p FROM Payment p WHERE p.registration.id = :registrationId AND p.transactionType = :transactionType")
    List<Payment> findByRegistrationIdAndTransactionType(@Param("registrationId") Integer registrationId, @Param("transactionType") TransactionType transactionType);

    @Query("SELECT p FROM Payment p WHERE p.registration.id = :registrationId")
    List<Payment> findByRegistrationId(@Param("registrationId") Integer registrationId);

    List<Payment> findByTransactionType(TransactionType transactionType);

    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.registration r LEFT JOIN FETCH r.race LEFT JOIN FETCH p.user WHERE p.transactionType = :transactionType ORDER BY p.id DESC")
    List<Payment> findByTransactionTypeOrderByIdDesc(@Param("transactionType") TransactionType transactionType);

    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.registration r LEFT JOIN FETCH r.race LEFT JOIN FETCH p.user WHERE p.transactionType = :transactionType AND r.race.id = :raceId ORDER BY p.id DESC")
    List<Payment> findByTransactionTypeAndRaceId(@Param("transactionType") TransactionType transactionType, @Param("raceId") Integer raceId);

    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.registration r LEFT JOIN FETCH r.race LEFT JOIN FETCH p.user WHERE p.transactionType = :transactionType AND p.awardType = :awardType ORDER BY p.id DESC")
    List<Payment> findByTransactionTypeAndAwardType(@Param("transactionType") TransactionType transactionType, @Param("awardType") AwardType awardType);

    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.registration r LEFT JOIN FETCH r.race LEFT JOIN FETCH p.user WHERE p.transactionType = :transactionType AND r.race.id = :raceId AND p.awardType = :awardType ORDER BY p.id DESC")
    List<Payment> findByTransactionTypeAndRaceIdAndAwardType(@Param("transactionType") TransactionType transactionType, @Param("raceId") Integer raceId, @Param("awardType") AwardType awardType);

    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.registration r LEFT JOIN FETCH r.race rc LEFT JOIN FETCH p.user WHERE p.transactionType = :transactionType AND rc.organizer.id = :organizerId ORDER BY p.id DESC")
    List<Payment> findByTransactionTypeAndOrganizerId(@Param("transactionType") TransactionType transactionType, @Param("organizerId") Integer organizerId);

    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.registration r LEFT JOIN FETCH r.race rc LEFT JOIN FETCH p.user WHERE p.transactionType = :transactionType AND rc.organizer.id = :organizerId AND rc.id = :raceId ORDER BY p.id DESC")
    List<Payment> findByTransactionTypeAndOrganizerIdAndRaceId(@Param("transactionType") TransactionType transactionType, @Param("organizerId") Integer organizerId, @Param("raceId") Integer raceId);

    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.registration r LEFT JOIN FETCH r.race rc LEFT JOIN FETCH p.user WHERE p.transactionType = :transactionType AND rc.organizer.id = :organizerId AND p.awardType = :awardType ORDER BY p.id DESC")
    List<Payment> findByTransactionTypeAndOrganizerIdAndAwardType(@Param("transactionType") TransactionType transactionType, @Param("organizerId") Integer organizerId, @Param("awardType") AwardType awardType);

    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.registration r LEFT JOIN FETCH r.race rc LEFT JOIN FETCH p.user WHERE p.transactionType = :transactionType AND rc.organizer.id = :organizerId AND rc.id = :raceId AND p.awardType = :awardType ORDER BY p.id DESC")
    List<Payment> findByTransactionTypeAndOrganizerIdAndRaceIdAndAwardType(@Param("transactionType") TransactionType transactionType, @Param("organizerId") Integer organizerId, @Param("raceId") Integer raceId, @Param("awardType") AwardType awardType);
}

