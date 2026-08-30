package com.kimbia.backend.config;

import com.kimbia.backend.entity.Race;
import com.kimbia.backend.enums.RaceStatus;
import jakarta.persistence.EntityManager;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private final EntityManager entityManager;

    public DataSeeder(EntityManager entityManager) {
        this.entityManager = entityManager;
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
    }
}
