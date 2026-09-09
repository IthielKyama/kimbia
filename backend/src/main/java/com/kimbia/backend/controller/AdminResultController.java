package com.kimbia.backend.controller;

import com.kimbia.backend.dto.ModerateResultRequest;
import com.kimbia.backend.entity.RaceResult;
import com.kimbia.backend.enums.ModerationStatus;
import com.kimbia.backend.service.RaceResultService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminResultController {

    private final RaceResultService raceResultService;

    @GetMapping("/races/{raceId}/results")
    public ResponseEntity<?> getResultsForRace(
            @PathVariable Integer raceId,
            @RequestParam(name = "moderation_status", required = false) ModerationStatus moderationStatus,
            @RequestParam(name = "status", required = false) ModerationStatus statusFallback,
            Authentication auth
    ) {
        try {
            ModerationStatus status = moderationStatus != null ? moderationStatus : statusFallback;
            List<RaceResult> results = raceResultService.getResultsForRaceAdmin(raceId, status, auth);
            return ResponseEntity.ok(results);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching results for race: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    @PutMapping("/results/{resultId}/moderate")
    public ResponseEntity<?> moderateResult(
            @PathVariable Integer resultId,
            @RequestBody ModerateResultRequest request,
            Authentication auth
    ) {
        try {
            RaceResult updated = raceResultService.moderateResult(resultId, request, auth);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error moderating race result: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}
