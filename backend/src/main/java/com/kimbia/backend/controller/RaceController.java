package com.kimbia.backend.controller;

import com.kimbia.backend.entity.Race;
import com.kimbia.backend.service.RaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/races")
@RequiredArgsConstructor
public class RaceController {

    private final RaceService raceService;

    @GetMapping
    public ResponseEntity<List<Race>> getPublishedRaces() {
        return ResponseEntity.ok(raceService.getPublishedRaces());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Race> getRaceById(@PathVariable Integer id) {
        return ResponseEntity.ok(raceService.getRaceById(id));
    }
}
