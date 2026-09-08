package com.kimbia.backend.entity;

import com.kimbia.backend.enums.RaceStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "races")
@Getter
@Setter
public class Race {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne
    @JoinColumn(name = "organizer_id")
    private User organizer;

    private String name;
    private String distance;
    private LocalDateTime raceDate;
    private BigDecimal fee;

    @Enumerated(EnumType.STRING)
    private RaceStatus status;

    @com.fasterxml.jackson.annotation.JsonProperty("bib_template_url")
    @com.fasterxml.jackson.annotation.JsonAlias("bibTemplateUrl")
    private String bibTemplateUrl;

    @com.fasterxml.jackson.annotation.JsonProperty("bibTemplateUrl")
    public String getBibTemplateUrlCamel() {
        return bibTemplateUrl;
    }

    private LocalDateTime submissionDeadline;

    @Column(length = 2000)
    private String description;

    @com.fasterxml.jackson.annotation.JsonProperty("organizer_id")
    public Integer getOrganizerId() {
        return organizer != null ? organizer.getId() : null;
    }

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "race")
    private List<Registration> registrations;
}
