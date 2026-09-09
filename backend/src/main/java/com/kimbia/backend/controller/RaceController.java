package com.kimbia.backend.controller;

import com.kimbia.backend.entity.Race;
import com.kimbia.backend.service.RaceResultService;
import com.kimbia.backend.service.RaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/races")
@RequiredArgsConstructor
public class RaceController {

    private final RaceService raceService;
    private final RaceResultService raceResultService;

    @GetMapping
    public ResponseEntity<List<Race>> getPublishedRaces() {
        return ResponseEntity.ok(raceService.getPublishedRaces());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Race> getRaceById(@PathVariable Integer id) {
        return ResponseEntity.ok(raceService.getRaceById(id));
    }

    @GetMapping("/{raceId}/leaderboard")
    public ResponseEntity<?> getLeaderboard(
            @PathVariable Integer raceId,
            @RequestParam(required = false) String category
    ) {
        return ResponseEntity.ok(raceResultService.getLeaderboard(raceId, category));
    }

    @GetMapping("/{raceId}/results")
    public ResponseEntity<?> getResults(
            @PathVariable Integer raceId,
            @RequestParam(name = "moderation_status", required = false) com.kimbia.backend.enums.ModerationStatus moderationStatus,
            org.springframework.security.core.Authentication auth
    ) {
        if (moderationStatus == null || moderationStatus == com.kimbia.backend.enums.ModerationStatus.APPROVED) {
            return ResponseEntity.ok(raceResultService.getResultsForRace(raceId, com.kimbia.backend.enums.ModerationStatus.APPROVED));
        }
        try {
            return ResponseEntity.ok(raceResultService.getResultsForRaceAdmin(raceId, moderationStatus, auth));
        } catch (SecurityException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createRace(
            @RequestBody com.kimbia.backend.dto.CreateRaceRequest request,
            org.springframework.security.core.Authentication auth
    ) {
        try {
            Race race = raceService.createRace(request, auth);
            return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(race);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to create race"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRace(
            @PathVariable Integer id,
            @RequestBody com.kimbia.backend.dto.UpdateRaceRequest request,
            org.springframework.security.core.Authentication auth
    ) {
        try {
            Race updated = raceService.updateRace(id, request, auth);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to update race"));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateRaceStatus(
            @PathVariable Integer id,
            @RequestBody com.kimbia.backend.dto.UpdateRaceStatusRequest request,
            org.springframework.security.core.Authentication auth
    ) {
        try {
            Race updated = raceService.updateRaceStatus(id, request, auth);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to update race status"));
        }
    }
}
