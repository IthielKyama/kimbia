package com.kimbia.backend.entity;

import com.kimbia.backend.enums.AccountStatus;
import com.kimbia.backend.enums.AuthProvider;
import com.kimbia.backend.enums.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String mobileNumber;

    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private AuthProvider authProvider;

    private String oauthProviderId;
    private String ageGroup;
    private String gender;

    @Enumerated(EnumType.STRING)
    private AccountStatus status;

    private String tinggServiceCode;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "organizer")
    private List<Race> organizes;

    @OneToMany(mappedBy = "user")
    private List<Registration> registrations;

    @OneToMany(mappedBy = "user")
    private List<Payment> payments;

    @OneToMany(mappedBy = "moderatedBy")
    private List<RaceResult> moderatedResults;
}
