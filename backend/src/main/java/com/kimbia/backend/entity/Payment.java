package com.kimbia.backend.entity;

import com.kimbia.backend.enums.AwardType;
import com.kimbia.backend.enums.PaymentStatus;
import com.kimbia.backend.enums.TransactionType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "registration_id")
    private Registration registration;

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    private AwardType awardType;

    private String destinationAccount;
    private String transactionRef;
    private BigDecimal amount;
    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private String idempotencyKey;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private String rawWebhookPayload;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

