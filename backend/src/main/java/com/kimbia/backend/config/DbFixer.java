package com.kimbia.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DbFixer implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;

    public DbFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        jdbcTemplate.update("UPDATE users SET age_group = 'AGE_18_35' WHERE age_group = '25-29'");
        jdbcTemplate.update("UPDATE users SET age_group = 'AGE_18_35' WHERE age_group NOT IN ('UNDER_18', 'AGE_18_35', 'AGE_36_50', 'AGE_51_65', 'OVER_65') AND age_group IS NOT NULL");
        jdbcTemplate.update("UPDATE users SET gender = 'FEMALE' WHERE gender = 'F' OR gender = 'Female'");
        jdbcTemplate.update("UPDATE users SET gender = 'MALE' WHERE gender = 'M' OR gender = 'Male'");
        jdbcTemplate.update("UPDATE users SET gender = 'OTHER' WHERE gender NOT IN ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY') AND gender IS NOT NULL");
    }
}
