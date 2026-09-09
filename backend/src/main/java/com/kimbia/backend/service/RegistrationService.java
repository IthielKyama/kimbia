package com.kimbia.backend.service;

import com.kimbia.backend.entity.Race;
import com.kimbia.backend.entity.Registration;
import com.kimbia.backend.entity.User;
import com.kimbia.backend.enums.Role;
import com.kimbia.backend.repository.RaceRepository;
import com.kimbia.backend.repository.RegistrationRepository;
import com.kimbia.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final RaceRepository raceRepository;

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new SecurityException("Authentication is required");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new SecurityException("User not found: " + auth.getName()));
    }

    public Optional<Registration> getRegistrationById(Integer id) {
        return registrationRepository.findById(id);
    }

    public List<Registration> getRegistrationsByRaceId(Integer raceId) {
        return registrationRepository.findByRaceId(raceId);
    }

    public List<Registration> getRegistrationsForAdmin(Integer raceId, Authentication auth) {
        return getRegistrationsForAdmin(raceId, null, auth);
    }

    public List<Registration> getRegistrationsForAdmin(Integer raceId, String paymentStatusStr, Authentication auth) {
        User currentUser = getAuthenticatedUser(auth);

        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new IllegalArgumentException("Race not found with id: " + raceId));

        if (currentUser.getRole() != Role.SUPER_ADMIN) {
            if (currentUser.getRole() != Role.RACE_ADMIN) {
                throw new SecurityException("Access denied: Race Admin or Super Admin role required");
            }
            if (race.getOrganizer() == null || !race.getOrganizer().getId().equals(currentUser.getId())) {
                throw new SecurityException("Access denied: You can only view registrations for races you organize");
            }
        }

        if (paymentStatusStr != null && !paymentStatusStr.trim().isEmpty()) {
            try {
                com.kimbia.backend.enums.PaymentStatus paymentStatus =
                        com.kimbia.backend.enums.PaymentStatus.valueOf(paymentStatusStr.trim().toUpperCase());
                return registrationRepository.findByRaceIdAndPaymentStatus(raceId, paymentStatus);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid payment status: " + paymentStatusStr +
                        ". Allowed values: PENDING, COMPLETED, FAILED");
            }
        }

        return registrationRepository.findByRaceId(raceId);
    }

    public List<Registration> getRegistrationsByUserId(Integer userId) {
        return registrationRepository.findByUserId(userId);
    }
}

