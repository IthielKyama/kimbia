package com.kimbia.backend.controller;

import com.kimbia.backend.dto.RegistrationStatusResponse;
import com.kimbia.backend.entity.Registration;
import com.kimbia.backend.service.RegistrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @GetMapping("/{registrationId}/status")
    public ResponseEntity<RegistrationStatusResponse> getStatus(@PathVariable Integer registrationId) {
        Registration reg = registrationService.getRegistrationById(registrationId).orElseThrow(() -> new RuntimeException("Not found"));
        RegistrationStatusResponse response = new RegistrationStatusResponse();
        response.setStatus(reg.getStatus());
        response.setPaymentStatus(reg.getPaymentStatus() != null ? reg.getPaymentStatus().name() : "PENDING");
        response.setBibNumber(reg.getBibNumber());
        response.setBibImgUrl(reg.getBibImgUrl());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-events")
    public ResponseEntity<java.util.List<Registration>> getMyRegistrations(@org.springframework.security.core.annotation.AuthenticationPrincipal com.kimbia.backend.entity.User user) {
        return ResponseEntity.ok(registrationService.getRegistrationsByUserId(user.getId()));
    }
}

