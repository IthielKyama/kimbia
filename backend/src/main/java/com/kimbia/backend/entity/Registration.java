package com.kimbia.backend.entity;

import com.kimbia.backend.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "registrations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "race_id"})
})
@Getter
@Setter
public class Registration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "race_id")
    private Race race;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    private String bibNumber;
    private String bibImgUrl;
    
    private String status; // ACTIVE/INACTIVE

    @CreationTimestamp
    private LocalDateTime registeredAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "registration")
    private List<Payment> payments;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToOne(mappedBy = "registration")
    private RaceResult raceResult;
}
