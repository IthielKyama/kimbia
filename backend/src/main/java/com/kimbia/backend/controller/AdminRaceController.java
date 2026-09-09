package com.kimbia.backend.controller;

import com.kimbia.backend.entity.Race;
import com.kimbia.backend.entity.Registration;
import com.kimbia.backend.service.RaceService;
import com.kimbia.backend.service.RegistrationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/races")
public class AdminRaceController {

    private final RegistrationService registrationService;
    private final RaceService raceService;

    public AdminRaceController(RegistrationService registrationService, RaceService raceService) {
        this.registrationService = registrationService;
        this.raceService = raceService;
    }

    @GetMapping
    public ResponseEntity<?> getAdminRaces(Authentication auth) {
        try {
            List<Race> races = raceService.getAdminRaces(auth);
            return ResponseEntity.ok(races);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to fetch admin races"));
        }
    }

    @GetMapping("/{raceId}/registrations")
    public ResponseEntity<?> getRegistrations(
            @PathVariable Integer raceId,
            @RequestParam(value = "payment_status", required = false) String paymentStatus,
            Authentication auth) {
        try {
            List<Registration> registrations = registrationService.getRegistrationsForAdmin(raceId, paymentStatus, auth);
            return ResponseEntity.ok(registrations);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to fetch registrations"));
        }
    }
}

