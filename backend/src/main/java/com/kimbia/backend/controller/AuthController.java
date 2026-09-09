package com.kimbia.backend.controller;

import com.kimbia.backend.dto.AuthRequest;
import com.kimbia.backend.dto.AuthResponse;
import com.kimbia.backend.dto.RegisterRequest;
import com.kimbia.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            return ResponseEntity.status(401).body(java.util.Map.of("error", "Invalid email or password"));
        } catch (org.springframework.security.core.AuthenticationException e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Authentication service error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody com.kimbia.backend.dto.RefreshTokenRequest request) {
        try {
            AuthResponse response = authService.refreshAccessToken(request);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(401).body(java.util.Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Failed to refresh token: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody(required = false) com.kimbia.backend.dto.RefreshTokenRequest request) {
        try {
            authService.logout(request);
            return ResponseEntity.ok(java.util.Map.of("message", "Logged out successfully"));
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.Map.of("message", "Logged out successfully"));
        }
    }
}
