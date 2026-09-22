package com.kimbia.backend.controller;

import com.kimbia.backend.dto.UpdateProfileRequest;
import com.kimbia.backend.entity.Registration;
import com.kimbia.backend.entity.User;
import com.kimbia.backend.repository.UserRepository;
import com.kimbia.backend.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final RegistrationService registrationService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UpdateProfileRequest request
    ) {
        User existingUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            existingUser.setName(request.getName().trim());
        }
        if (request.getMobileNumber() != null) {
            existingUser.setMobileNumber(request.getMobileNumber().trim());
        }
        if (request.getAgeGroup() != null) {
            existingUser.setAgeGroup(request.getAgeGroup());
        }
        if (request.getGender() != null) {
            existingUser.setGender(request.getGender());
        }
        if (request.getAvatarUrl() != null) {
            existingUser.setAvatarUrl(request.getAvatarUrl().trim());
        }
        if (request.getDateOfBirth() != null) {
            existingUser.setDateOfBirth(request.getDateOfBirth().trim());
        }

        User updatedUser = userRepository.save(existingUser);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/me/registrations")
    public ResponseEntity<List<Registration>> getMyRegistrations(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(registrationService.getRegistrationsByUserId(user.getId()));
    }
}
