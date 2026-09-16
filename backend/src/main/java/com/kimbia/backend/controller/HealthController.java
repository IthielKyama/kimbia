package com.kimbia.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HealthController {

    @Autowired(required = false)
    private DataSource dataSource;

    @GetMapping({"/health", "/api/health"})
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("service", "kimbia-backend");
        response.put("timestamp", Instant.now().toString());

        if (dataSource != null) {
            try (Connection connection = dataSource.getConnection()) {
                if (connection.isValid(2)) {
                    response.put("database", "UP");
                } else {
                    response.put("database", "DEGRADED");
                }
            } catch (Exception e) {
                response.put("database", "UNAVAILABLE");
                response.put("databaseError", e.getMessage());
            }
        }

        return ResponseEntity.ok(response);
    }
}
