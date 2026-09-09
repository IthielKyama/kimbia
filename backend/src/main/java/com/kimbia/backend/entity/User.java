package com.kimbia.backend.entity;

import com.kimbia.backend.enums.AccountStatus;
import com.kimbia.backend.enums.AuthProvider;
import com.kimbia.backend.enums.Role;
import com.kimbia.backend.enums.AgeGroup;
import com.kimbia.backend.enums.Gender;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String mobileNumber;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private AuthProvider authProvider;

    private String oauthProviderId;
    @Enumerated(EnumType.STRING)
    private AgeGroup ageGroup;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String dateOfBirth;

    @Enumerated(EnumType.STRING)
    private AccountStatus status;

    @JsonProperty("tingg_service_code")
    private String tinggServiceCode;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @JsonProperty("organization")
    public String getOrganization() {
        return name;
    }

    @JsonProperty("phone")
    public String getPhone() {
        return mobileNumber;
    }

    @JsonProperty("tinggAccountId")
    public String getTinggAccountId() {
        return tinggServiceCode;
    }

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "organizer")
    private List<Race> organizes;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "user")
    private List<Registration> registrations;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "user")
    private List<Payment> payments;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "moderatedBy")
    private List<RaceResult> moderatedResults;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Override
    public String getPassword() {
        return passwordHash;
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Override
    public String getUsername() {
        return email;
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Override
    public boolean isEnabled() {
        return true;
    }
}
