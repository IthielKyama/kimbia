package com.kimbia.backend.repository;

import com.kimbia.backend.entity.Payment;
import com.kimbia.backend.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    Optional<Payment> findByTransactionRef(String transactionRef);
    List<Payment> findByRegistrationIdAndTransactionType(Integer registrationId, TransactionType transactionType);
    List<Payment> findByRegistrationId(Integer registrationId);
    List<Payment> findByTransactionType(TransactionType transactionType);
}

