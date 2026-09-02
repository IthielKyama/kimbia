package com.kimbia.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class RaceSeeder implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;

    public RaceSeeder(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        // Check if races already exist
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM races", Integer.class);
        if (count != null && count < 3) {
            System.out.println("Seeding races...");
            String insertSql = "INSERT INTO races (name, distance, race_date, fee, status, bib_template_url, submission_deadline, created_at, updated_at) " +
                    "VALUES (?, ?, ?::timestamp, ?, ?, ?, ?::timestamp, NOW(), NOW())";
            
            jdbcTemplate.update(insertSql, 
                "Nairobi City Marathon 2026", 
                "42.195 KM", 
                "2026-10-25 06:00:00", 
                1500.00, 
                "PUBLISHED", 
                "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80", 
                "2026-10-25 18:00:00"
            );
            
            jdbcTemplate.update(insertSql, 
                "Lewa Safari Marathon", 
                "21 KM", 
                "2026-06-28 07:00:00", 
                2500.00, 
                "PUBLISHED", 
                "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80", 
                "2026-06-28 18:00:00"
            );
            
            jdbcTemplate.update(insertSql, 
                "Karura Forest 10K", 
                "10 KM", 
                "2026-11-15 08:00:00", 
                1000.00, 
                "PUBLISHED", 
                "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80", 
                "2026-11-15 18:00:00"
            );
            
            System.out.println("Races seeded successfully.");
        }
    }
}
