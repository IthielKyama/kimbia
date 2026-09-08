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
            @RequestParam(name = "moderation_status", required = false) com.kimbia.backend.enums.ModerationStatus moderationStatus
    ) {
        return ResponseEntity.ok(raceResultService.getResultsForRace(raceId, moderationStatus));
    }
}
