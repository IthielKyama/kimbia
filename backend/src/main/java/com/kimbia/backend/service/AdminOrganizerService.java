package com.kimbia.backend.service;

import com.kimbia.backend.dto.ApproveOrganizerRequest;
import com.kimbia.backend.entity.User;
import com.kimbia.backend.enums.AccountStatus;
import com.kimbia.backend.enums.Role;
import com.kimbia.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminOrganizerService {

    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new SecurityException("Authentication is required");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new SecurityException("User not found: " + auth.getName()));
    }

    public List<User> getOrganizers(AccountStatus status, Authentication auth) {
        User currentUser = getAuthenticatedUser(auth);
        if (currentUser.getRole() != Role.SUPER_ADMIN) {
            throw new SecurityException("Access denied: SUPER_ADMIN role required");
        }

        if (status != null) {
            return userRepository.findByRoleAndStatusOrderByCreatedAtDesc(Role.RACE_ADMIN, status);
        }
        return userRepository.findByRoleOrderByCreatedAtDesc(Role.RACE_ADMIN);
    }

    public User approveOrganizer(Integer organizerId, ApproveOrganizerRequest request, Authentication auth) {
        User currentUser = getAuthenticatedUser(auth);
        if (currentUser.getRole() != Role.SUPER_ADMIN) {
            throw new SecurityException("Access denied: SUPER_ADMIN role required");
        }

        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new IllegalArgumentException("Organizer not found with id: " + organizerId));

        if (organizer.getRole() != Role.RACE_ADMIN) {
            throw new IllegalArgumentException("User is not a race organizer: " + organizerId);
        }

        String serviceCode = request != null ? request.getTinggServiceCode() : null;
        if (serviceCode == null || serviceCode.trim().isEmpty()) {
            throw new IllegalArgumentException("tingg_service_code is required for organizer approval");
        }

        organizer.setStatus(AccountStatus.APPROVED);
        organizer.setTinggServiceCode(serviceCode.trim());
        return userRepository.save(organizer);
    }
}
