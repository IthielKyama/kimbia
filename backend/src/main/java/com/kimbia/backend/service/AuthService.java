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
        user.setRole(Role.RUNNER);
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setStatus(AccountStatus.ACTIVE);

        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken, user.getId(), user.getRole());
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
                
        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken, user.getId(), user.getRole());
    }
}
