package com.kimbia.backend.config;

import com.kimbia.backend.entity.Race;
import com.kimbia.backend.entity.User;
import com.kimbia.backend.enums.AccountStatus;
import com.kimbia.backend.enums.AuthProvider;
import com.kimbia.backend.enums.RaceStatus;
import com.kimbia.backend.enums.Role;
import com.kimbia.backend.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private final EntityManager entityManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(EntityManager entityManager, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.entityManager = entityManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        Long raceCount = entityManager.createQuery("SELECT COUNT(r) FROM Race r", Long.class).getSingleResult();
        
        if (raceCount == 0) {
            Race race = new Race();
            race.setName("Nairobi Virtual 5K");
            race.setDistance("5K");
            race.setFee(new BigDecimal("500.00"));
            race.setStatus(RaceStatus.PUBLISHED);
            race.setRaceDate(LocalDateTime.now().plusDays(30));
            race.setSubmissionDeadline(LocalDateTime.now().plusDays(31));
            
            entityManager.persist(race);
            System.out.println("Seeded dummy race: Nairobi Virtual 5K");
        }

        // Seed Super Admin if missing
        if (!userRepository.existsByEmail("superadmin@kimbia.com")) {
            User superAdmin = new User();
            superAdmin.setName("System Super Admin");
            superAdmin.setEmail("superadmin@kimbia.com");
            superAdmin.setPasswordHash(passwordEncoder.encode("password123"));
            superAdmin.setRole(Role.SUPER_ADMIN);
            superAdmin.setStatus(AccountStatus.ACTIVE);
            superAdmin.setAuthProvider(AuthProvider.LOCAL);
            superAdmin.setMobileNumber("+254700000001");
            userRepository.save(superAdmin);
            System.out.println("Seeded Super Admin: superadmin@kimbia.com / password123");
        }

        // Seed Approved Race Admin if missing
        if (!userRepository.existsByEmail("organizer@kimbia.com")) {
            User approvedAdmin = new User();
            approvedAdmin.setName("Approved Race Admin");
            approvedAdmin.setEmail("organizer@kimbia.com");
            approvedAdmin.setPasswordHash(passwordEncoder.encode("password123"));
            approvedAdmin.setRole(Role.RACE_ADMIN);
            approvedAdmin.setStatus(AccountStatus.APPROVED);
            approvedAdmin.setAuthProvider(AuthProvider.LOCAL);
            approvedAdmin.setMobileNumber("+254700000002");
            approvedAdmin.setTinggServiceCode("SRV-TEST-ORG-01");
            userRepository.save(approvedAdmin);
            System.out.println("Seeded Approved Organizer: organizer@kimbia.com / password123");
        }

        // Seed Pending Race Admin if missing
        if (!userRepository.existsByEmail("pending@kimbia.com")) {
            User pendingAdmin = new User();
            pendingAdmin.setName("Pending Race Admin");
            pendingAdmin.setEmail("pending@kimbia.com");
            pendingAdmin.setPasswordHash(passwordEncoder.encode("password123"));
            pendingAdmin.setRole(Role.RACE_ADMIN);
            pendingAdmin.setStatus(AccountStatus.PENDING_VETTING);
            pendingAdmin.setAuthProvider(AuthProvider.LOCAL);
            pendingAdmin.setMobileNumber("+254700000003");
            userRepository.save(pendingAdmin);
            System.out.println("Seeded Pending Organizer: pending@kimbia.com / password123");
        }
    }
}
