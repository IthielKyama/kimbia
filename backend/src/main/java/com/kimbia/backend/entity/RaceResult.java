package com.kimbia.backend.entity;

import com.kimbia.backend.enums.ModerationStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "race_results")
@Getter
@Setter
public class RaceResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToOne
    @JoinColumn(name = "registration_id")
    private Registration registration;

    private String finishingTime;
    private String proofImageUrl;
    private Boolean isDnf;

    @Enumerated(EnumType.STRING)
    private ModerationStatus moderationStatus;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne
    @JoinColumn(name = "moderated_by")
    private User moderatedBy;

    @CreationTimestamp
    private LocalDateTime submittedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
