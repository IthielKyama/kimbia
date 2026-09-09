package com.kimbia.backend.controller;

import com.kimbia.backend.dto.ApproveOrganizerRequest;
import com.kimbia.backend.entity.User;
import com.kimbia.backend.enums.AccountStatus;
import com.kimbia.backend.service.AdminOrganizerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/organizers")
@RequiredArgsConstructor
public class AdminOrganizerController {

    private final AdminOrganizerService adminOrganizerService;

    @GetMapping
    public ResponseEntity<?> getOrganizers(
            @RequestParam(required = false) AccountStatus status,
            Authentication auth
    ) {
        try {
            List<User> organizers = adminOrganizerService.getOrganizers(status, auth);
            return ResponseEntity.ok(organizers);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to fetch organizers"));
        }
    }

    @PutMapping("/{organizerId}/approve")
    public ResponseEntity<?> approveOrganizer(
            @PathVariable Integer organizerId,
            @RequestBody ApproveOrganizerRequest request,
            Authentication auth
    ) {
        try {
            User updatedOrganizer = adminOrganizerService.approveOrganizer(organizerId, request, auth);
            return ResponseEntity.ok(updatedOrganizer);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to approve organizer"));
        }
    }
}
