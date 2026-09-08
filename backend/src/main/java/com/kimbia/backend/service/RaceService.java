package com.kimbia.backend.service;

import com.kimbia.backend.dto.CreateRaceRequest;
import com.kimbia.backend.dto.UpdateRaceRequest;
import com.kimbia.backend.dto.UpdateRaceStatusRequest;
import com.kimbia.backend.entity.Race;
import com.kimbia.backend.entity.User;
import com.kimbia.backend.enums.AccountStatus;
import com.kimbia.backend.enums.RaceStatus;
import com.kimbia.backend.enums.Role;
import com.kimbia.backend.repository.RaceRepository;
import com.kimbia.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RaceService {

    public static final Set<String> ALLOWED_DISTANCES = Set.of(
            "5K", "5 KM", "5.0 KM", "10K", "10 KM", "15K", "15 KM",
            "21.1K", "21 KM", "42.2K", "42.195 KM", "42 KM", "50K", "50 KM"
    );

    private final RaceRepository raceRepository;
    private final UserRepository userRepository;

    public List<Race> getPublishedRaces() {
        return raceRepository.findByStatus(RaceStatus.PUBLISHED);
    }

    public Race getRaceById(Integer id) {
        return raceRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Race not found with id: " + id));
    }

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new SecurityException("Authentication is required");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new SecurityException("User not found: " + auth.getName()));
    }

    private String validateAndFormatDistances(String rawDistance) {
        if (rawDistance == null || rawDistance.trim().isEmpty()) {
            throw new IllegalArgumentException("Distance is required");
        }
        String[] parts = rawDistance.split(",");
        List<String> validDistances = new ArrayList<>();
        for (String part : parts) {
            String trimmed = part.trim();
            if (trimmed.isEmpty()) continue;
            if (!ALLOWED_DISTANCES.contains(trimmed.toUpperCase())) {
                throw new IllegalArgumentException("Invalid race distance: '" + trimmed + "'. Allowed selectable distances: 5K, 10K, 15K, 21.1K, 42.2K, 50K");
            }
            validDistances.add(trimmed);
        }
        if (validDistances.isEmpty()) {
            throw new IllegalArgumentException("At least one valid race distance is required");
        }
        return String.join(", ", validDistances);
    }

    public Race createRace(CreateRaceRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);

        if (user.getRole() != Role.RACE_ADMIN && user.getRole() != Role.SUPER_ADMIN) {
            throw new SecurityException("Only Race Admins or Super Admins can create races");
        }

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Race name is required");
        }
        String formattedDistance = validateAndFormatDistances(request.getDistance());
        if (request.getRaceDate() == null) {
            throw new IllegalArgumentException("Race date is required");
        }
        if (request.getFee() == null || request.getFee().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Valid registration fee is required");
        }

        Race race = new Race();
        race.setName(request.getName().trim());
        race.setDistance(formattedDistance);
        race.setRaceDate(request.getRaceDate());
        race.setFee(request.getFee());
        race.setSubmissionDeadline(request.getSubmissionDeadline() != null
                ? request.getSubmissionDeadline()
                : request.getRaceDate().plusDays(1));
        race.setBibTemplateUrl(request.getBibTemplateUrl());
        race.setDescription(request.getDescription());
        race.setOrganizer(user);
        race.setStatus(RaceStatus.DRAFT);

        return raceRepository.save(race);
    }

    public List<Race> getAdminRaces(Authentication auth) {
        User user = getAuthenticatedUser(auth);

        if (user.getRole() == Role.SUPER_ADMIN) {
            return raceRepository.findAllByOrderByCreatedAtDesc();
        } else if (user.getRole() == Role.RACE_ADMIN) {
            return raceRepository.findByOrganizerIdOrderByCreatedAtDesc(user.getId());
        } else {
            throw new SecurityException("Access denied: Race Admin or Super Admin role required");
        }
    }

    public Race updateRace(Integer raceId, UpdateRaceRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new IllegalArgumentException("Race not found with id: " + raceId));

        if (user.getRole() != Role.SUPER_ADMIN &&
                (race.getOrganizer() == null || !race.getOrganizer().getId().equals(user.getId()))) {
            throw new SecurityException("You do not have permission to modify this race");
        }

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            race.setName(request.getName().trim());
        }
        if (request.getDistance() != null && !request.getDistance().trim().isEmpty()) {
            race.setDistance(validateAndFormatDistances(request.getDistance()));
        }
        if (request.getRaceDate() != null) {
            race.setRaceDate(request.getRaceDate());
        }
        if (request.getFee() != null && request.getFee().compareTo(BigDecimal.ZERO) >= 0) {
            race.setFee(request.getFee());
        }
        if (request.getSubmissionDeadline() != null) {
            race.setSubmissionDeadline(request.getSubmissionDeadline());
        }
        if (request.getBibTemplateUrl() != null) {
            race.setBibTemplateUrl(request.getBibTemplateUrl());
        }
        if (request.getDescription() != null) {
            race.setDescription(request.getDescription());
        }

        return raceRepository.save(race);
    }

    public Race updateRaceStatus(Integer raceId, UpdateRaceStatusRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new IllegalArgumentException("Race not found with id: " + raceId));

        if (user.getRole() != Role.SUPER_ADMIN &&
                (race.getOrganizer() == null || !race.getOrganizer().getId().equals(user.getId()))) {
            throw new SecurityException("You do not have permission to update this race");
        }

        RaceStatus targetStatus = request.getStatus();
        if (targetStatus == null) {
            throw new IllegalArgumentException("Target status is required");
        }

        if (targetStatus == RaceStatus.PUBLISHED) {
            if (user.getRole() == Role.RACE_ADMIN && user.getStatus() != AccountStatus.APPROVED) {
                throw new IllegalStateException("Your organizer account is pending KYC vetting. You cannot publish races until approved by a Super Admin.");
            }
        }

        race.setStatus(targetStatus);
        return raceRepository.save(race);
    }
}
