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

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
