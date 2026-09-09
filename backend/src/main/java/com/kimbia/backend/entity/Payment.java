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

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @com.fasterxml.jackson.annotation.JsonIgnore
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

    @com.fasterxml.jackson.annotation.JsonProperty("runner_name")
    public String getRunnerName() {
        return user != null ? user.getName() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("runner_phone")
    public String getRunnerPhone() {
        return destinationAccount != null ? destinationAccount : (user != null ? user.getMobileNumber() : null);
    }

    @com.fasterxml.jackson.annotation.JsonProperty("race_name")
    public String getRaceName() {
        return (registration != null && registration.getRace() != null) ? registration.getRace().getName() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("race_id")
    public Integer getRaceId() {
        return (registration != null && registration.getRace() != null) ? registration.getRace().getId() : null;
    }
}

