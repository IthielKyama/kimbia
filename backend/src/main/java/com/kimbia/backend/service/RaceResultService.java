package com.kimbia.backend.service;

import com.kimbia.backend.dto.ModerateResultRequest;
import com.kimbia.backend.dto.SubmitResultRequest;
import com.kimbia.backend.entity.Race;
import com.kimbia.backend.entity.RaceResult;
import com.kimbia.backend.entity.Registration;
import com.kimbia.backend.entity.User;
import com.kimbia.backend.enums.ModerationStatus;
import com.kimbia.backend.enums.PaymentStatus;
import com.kimbia.backend.enums.Role;
import com.kimbia.backend.repository.RaceRepository;
import com.kimbia.backend.repository.RaceResultRepository;
import com.kimbia.backend.repository.RegistrationRepository;
import com.kimbia.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RaceResultService {

    private final RaceResultRepository raceResultRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final RaceRepository raceRepository;

    @Transactional
    public RaceResult submitResult(SubmitResultRequest request, Authentication auth) {
        if (request.getRegistrationId() == null) {
            throw new IllegalArgumentException("Registration ID is required");
        }

        Registration registration = registrationRepository.findById(request.getRegistrationId())
                .orElseThrow(() -> new IllegalArgumentException("Registration not found for ID: " + request.getRegistrationId()));

        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            String email = auth.getName();
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().contains("ADMIN"));
            if (!isAdmin && registration.getUser() != null && !email.equalsIgnoreCase(registration.getUser().getEmail())) {
                throw new SecurityException("You can only submit results for your own registration.");
            }
        }

        if (registration.getPaymentStatus() != PaymentStatus.COMPLETED) {
            throw new IllegalStateException("Registration payment is not completed. Current payment status: " + registration.getPaymentStatus());
        }

        RaceResult raceResult = raceResultRepository.findByRegistrationId(registration.getId())
                .orElseGet(() -> {
                    RaceResult r = new RaceResult();
                    r.setRegistration(registration);
                    return r;
                });

        raceResult.setFinishingTime(request.getFinishingTime());
        raceResult.setProofImageUrl(request.getProofImageUrl());
        raceResult.setIsDnf(Boolean.TRUE.equals(request.getIsDnf()));
        raceResult.setModerationStatus(ModerationStatus.PENDING);

        return raceResultRepository.save(raceResult);
    }

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new SecurityException("Authentication is required");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new SecurityException("User not found: " + auth.getName()));
    }

    public List<RaceResult> getResultsForRaceAdmin(Integer raceId, ModerationStatus status, Authentication auth) {
        User currentUser = getAuthenticatedUser(auth);

        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new IllegalArgumentException("Race not found with id: " + raceId));

        if (currentUser.getRole() != Role.SUPER_ADMIN) {
            if (currentUser.getRole() != Role.RACE_ADMIN) {
                throw new SecurityException("Access denied: Race Admin or Super Admin role required");
            }
            if (race.getOrganizer() == null || !race.getOrganizer().getId().equals(currentUser.getId())) {
                throw new SecurityException("Access denied: You can only view moderation results for races you organize");
            }
        }

        if (status != null) {
            return raceResultRepository.findByRaceIdAndModerationStatus(raceId, status);
        }
        return raceResultRepository.findByRaceId(raceId);
    }

    @Transactional
    public RaceResult moderateResult(Integer resultId, ModerateResultRequest request, Authentication auth) {
        User currentUser = getAuthenticatedUser(auth);

        if (request.getModerationStatus() == null) {
            throw new IllegalArgumentException("Moderation status is required");
        }

        RaceResult result = raceResultRepository.findById(resultId)
                .orElseThrow(() -> new IllegalArgumentException("Race result not found for ID: " + resultId));

        Race race = result.getRegistration() != null ? result.getRegistration().getRace() : null;

        if (currentUser.getRole() != Role.SUPER_ADMIN) {
            if (currentUser.getRole() != Role.RACE_ADMIN) {
                throw new SecurityException("Access denied: Race Admin or Super Admin role required");
            }
            if (race == null || race.getOrganizer() == null || !race.getOrganizer().getId().equals(currentUser.getId())) {
                throw new SecurityException("Access denied: You can only moderate results for races you organize");
            }
        }

        result.setModerationStatus(request.getModerationStatus());
        result.setModeratedBy(currentUser);

        return raceResultRepository.save(result);
    }

    public List<RaceResult> getResultsForRace(Integer raceId, ModerationStatus status) {
        if (status != null) {
            return raceResultRepository.findByRaceIdAndModerationStatus(raceId, status);
        }
        return raceResultRepository.findByRaceId(raceId);
    }

    public List<RaceResult> getLeaderboard(Integer raceId, String category) {
        List<RaceResult> approved = raceResultRepository.findByRaceIdAndModerationStatus(raceId, ModerationStatus.APPROVED);
        return approved.stream()
                .filter(r -> !Boolean.TRUE.equals(r.getIsDnf()))
                .filter(r -> r.getFinishingTime() != null && !r.getFinishingTime().trim().isEmpty())
                .sorted(Comparator.comparing(RaceResult::getFinishingTime))
                .collect(Collectors.toList());
    }
}
