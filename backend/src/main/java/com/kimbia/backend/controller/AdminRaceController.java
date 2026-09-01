package com.kimbia.backend.controller;

import com.kimbia.backend.entity.Registration;
import com.kimbia.backend.service.RegistrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/races")
public class AdminRaceController {

    private final RegistrationService registrationService;

    public AdminRaceController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @GetMapping("/{raceId}/registrations")
    public ResponseEntity<List<Registration>> getRegistrations(@PathVariable Integer raceId) {
        List<Registration> registrations = registrationService.getRegistrationsByRaceId(raceId);
        return ResponseEntity.ok(registrations);
    }
}

