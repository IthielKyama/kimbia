package com.kimbia.backend.service;

import com.kimbia.backend.entity.Race;
import com.kimbia.backend.enums.RaceStatus;
import com.kimbia.backend.repository.RaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RaceService {

    private final RaceRepository raceRepository;

    public List<Race> getPublishedRaces() {
        return raceRepository.findByStatus(RaceStatus.PUBLISHED);
    }

    public Race getRaceById(Integer id) {
        return raceRepository.findById(id).orElseThrow(() -> new RuntimeException("Race not found"));
    }
}
