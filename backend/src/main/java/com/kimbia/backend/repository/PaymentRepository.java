package com.kimbia.backend.repository;

import com.kimbia.backend.entity.Payment;
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
}

