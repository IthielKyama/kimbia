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

    @com.fasterxml.jackson.annotation.JsonProperty("finishing_time")
    @com.fasterxml.jackson.annotation.JsonAlias("finishingTime")
    private String finishingTime;

    @com.fasterxml.jackson.annotation.JsonProperty("proof_image_url")
    @com.fasterxml.jackson.annotation.JsonAlias("proofImageUrl")
    private String proofImageUrl;

    @com.fasterxml.jackson.annotation.JsonProperty("is_dnf")
    @com.fasterxml.jackson.annotation.JsonAlias("isDnf")
    private Boolean isDnf;

    @Enumerated(EnumType.STRING)
    @com.fasterxml.jackson.annotation.JsonProperty("moderation_status")
    @com.fasterxml.jackson.annotation.JsonAlias("moderationStatus")
    private ModerationStatus moderationStatus;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne
    @JoinColumn(name = "moderated_by")
    private User moderatedBy;

    @CreationTimestamp
    @com.fasterxml.jackson.annotation.JsonProperty("submitted_at")
    @com.fasterxml.jackson.annotation.JsonAlias("submittedAt")
    private LocalDateTime submittedAt;

    @UpdateTimestamp
    @com.fasterxml.jackson.annotation.JsonProperty("updated_at")
    @com.fasterxml.jackson.annotation.JsonAlias("updatedAt")
    private LocalDateTime updatedAt;

    @com.fasterxml.jackson.annotation.JsonProperty("registration_id")
    public Integer getRegistrationId() {
        return registration != null ? registration.getId() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("runner_name")
    public String getRunnerName() {
        return (registration != null && registration.getUser() != null) ? registration.getUser().getName() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("runner_email")
    public String getRunnerEmail() {
        return (registration != null && registration.getUser() != null) ? registration.getUser().getEmail() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("race_id")
    public Integer getRaceId() {
        return (registration != null && registration.getRace() != null) ? registration.getRace().getId() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("bib_number")
    public String getBibNumber() {
        return registration != null ? registration.getBibNumber() : null;
    }
}
