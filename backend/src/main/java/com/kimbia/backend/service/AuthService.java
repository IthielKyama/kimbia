package com.kimbia.backend.service;

import com.kimbia.backend.dto.AuthRequest;
import com.kimbia.backend.dto.AuthResponse;
import com.kimbia.backend.dto.RegisterRequest;
import com.kimbia.backend.entity.User;
import com.kimbia.backend.enums.AccountStatus;
import com.kimbia.backend.enums.AuthProvider;
import com.kimbia.backend.enums.Role;
import com.kimbia.backend.repository.UserRepository;
import com.kimbia.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setMobileNumber(request.getMobileNumber());
        user.setAgeGroup(request.getAgeGroup());
        user.setGender(request.getGender());
        user.setDateOfBirth(request.getDateOfBirth());
        if (request.getRole() == Role.SUPER_ADMIN) {
            throw new IllegalArgumentException("Registration of SUPER_ADMIN accounts is not permitted.");
        }

        if (request.getRole() == Role.RACE_ADMIN) {
            user.setRole(Role.RACE_ADMIN);
            user.setStatus(AccountStatus.PENDING_VETTING);
        } else {
            user.setRole(Role.RUNNER);
            user.setStatus(AccountStatus.ACTIVE);
        }
        user.setAuthProvider(AuthProvider.LOCAL);

        user = userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);
        com.kimbia.backend.entity.RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(jwtToken, jwtToken, refreshToken.getToken(), user.getId(), user.getRole());
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + request.getEmail()));

        String jwtToken = jwtService.generateToken(user);
        com.kimbia.backend.entity.RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(jwtToken, jwtToken, refreshToken.getToken(), user.getId(), user.getRole());
    }

    @org.springframework.transaction.annotation.Transactional
    public AuthResponse refreshAccessToken(com.kimbia.backend.dto.RefreshTokenRequest request) {
        if (request == null || request.getRefreshToken() == null || request.getRefreshToken().trim().isEmpty()) {
            throw new IllegalArgumentException("Refresh token is required");
        }

        com.kimbia.backend.entity.RefreshToken token = refreshTokenService.findByToken(request.getRefreshToken().trim())
                .orElseThrow(() -> new SecurityException("Invalid refresh token. Please sign in again."));

        token = refreshTokenService.verifyExpiration(token);

        // Perform token rotation: invalidate old refresh token, generate new refresh token
        com.kimbia.backend.entity.RefreshToken rotatedToken = refreshTokenService.rotateRefreshToken(token);
        User user = rotatedToken.getUser();

        String newAccessToken = jwtService.generateToken(user);

        return new AuthResponse(newAccessToken, newAccessToken, rotatedToken.getToken(), user.getId(), user.getRole());
    }

    public void logout(com.kimbia.backend.dto.RefreshTokenRequest request) {
        if (request != null && request.getRefreshToken() != null) {
            refreshTokenService.revokeToken(request.getRefreshToken());
        }
    }
}
