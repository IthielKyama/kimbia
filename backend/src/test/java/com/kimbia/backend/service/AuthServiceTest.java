package com.kimbia.backend.service;

import com.kimbia.backend.dto.AuthRequest;
import com.kimbia.backend.dto.AuthResponse;
import com.kimbia.backend.dto.RefreshTokenRequest;
import com.kimbia.backend.dto.RegisterRequest;
import com.kimbia.backend.entity.RefreshToken;
import com.kimbia.backend.entity.User;
import com.kimbia.backend.enums.AccountStatus;
import com.kimbia.backend.enums.AuthProvider;
import com.kimbia.backend.enums.Role;
import com.kimbia.backend.repository.UserRepository;
import com.kimbia.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private RefreshTokenService refreshTokenService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtService, authenticationManager, refreshTokenService);
    }

    @Test
    void register_emailAlreadyExists_throwsRuntimeException() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("existing@kimbia.africa");

        when(userRepository.existsByEmail("existing@kimbia.africa")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_superAdminRoleRequested_throwsIllegalArgumentException() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("superadmin@kimbia.africa");
        req.setPassword("pass123");
        req.setRole(Role.SUPER_ADMIN);

        when(userRepository.existsByEmail("superadmin@kimbia.africa")).thenReturn(false);
        when(passwordEncoder.encode("pass123")).thenReturn("encoded-pass");

        assertThrows(IllegalArgumentException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_raceAdmin_setsPendingVettingAndLocalProvider() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Race Director");
        req.setEmail("admin@marathon.ke");
        req.setPassword("secret123");
        req.setRole(Role.RACE_ADMIN);

        when(userRepository.existsByEmail("admin@marathon.ke")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encoded-pass");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(10);
            return u;
        });

        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token-123");

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refresh-token-123");
        when(refreshTokenService.createRefreshToken(any(User.class))).thenReturn(refreshToken);

        AuthResponse response = authService.register(req);

        assertNotNull(response);
        assertEquals("jwt-token-123", response.getToken());
        assertEquals("refresh-token-123", response.getRefreshToken());
        assertEquals(10, response.getUserId());
        assertEquals(Role.RACE_ADMIN, response.getRole());

        verify(userRepository).save(argThat(user ->
                user.getRole() == Role.RACE_ADMIN &&
                user.getStatus() == AccountStatus.PENDING_VETTING &&
                user.getAuthProvider() == AuthProvider.LOCAL
        ));
    }

    @Test
    void register_runner_setsActiveAndLocalProvider() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Eliud Kipchoge");
        req.setEmail("eliud@kimbia.africa");
        req.setPassword("sub2hour");
        req.setRole(Role.RUNNER);

        when(userRepository.existsByEmail("eliud@kimbia.africa")).thenReturn(false);
        when(passwordEncoder.encode("sub2hour")).thenReturn("encoded-pass");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(5);
            return u;
        });

        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-runner");

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refresh-runner");
        when(refreshTokenService.createRefreshToken(any(User.class))).thenReturn(refreshToken);

        AuthResponse response = authService.register(req);

        assertNotNull(response);
        assertEquals(Role.RUNNER, response.getRole());

        verify(userRepository).save(argThat(user ->
                user.getRole() == Role.RUNNER &&
                user.getStatus() == AccountStatus.ACTIVE &&
                user.getAuthProvider() == AuthProvider.LOCAL
        ));
    }

    @Test
    void login_successful_authenticatesAndReturnsTokens() {
        AuthRequest req = new AuthRequest();
        req.setEmail("runner@kimbia.africa");
        req.setPassword("password123");

        User user = new User();
        user.setId(7);
        user.setEmail("runner@kimbia.africa");
        user.setRole(Role.RUNNER);

        when(userRepository.findByEmail("runner@kimbia.africa")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt-login-token");

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refresh-login-token");
        when(refreshTokenService.createRefreshToken(user)).thenReturn(refreshToken);

        AuthResponse response = authService.login(req);

        assertNotNull(response);
        assertEquals("jwt-login-token", response.getToken());
        assertEquals("refresh-login-token", response.getRefreshToken());
        assertEquals(7, response.getUserId());
        assertEquals(Role.RUNNER, response.getRole());

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void login_userNotFound_throwsIllegalArgumentException() {
        AuthRequest req = new AuthRequest();
        req.setEmail("missing@kimbia.africa");
        req.setPassword("pass");

        when(userRepository.findByEmail("missing@kimbia.africa")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> authService.login(req));
    }

    @Test
    void login_badCredentials_propagatesAuthenticationException() {
        AuthRequest req = new AuthRequest();
        req.setEmail("runner@kimbia.africa");
        req.setPassword("wrongpassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(req));
        verify(userRepository, never()).findByEmail(any());
    }

    @Test
    void refreshAccessToken_nullOrEmptyToken_throwsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> authService.refreshAccessToken(null));

        RefreshTokenRequest reqNull = new RefreshTokenRequest();
        reqNull.setRefreshToken(null);
        assertThrows(IllegalArgumentException.class, () -> authService.refreshAccessToken(reqNull));

        RefreshTokenRequest reqBlank = new RefreshTokenRequest();
        reqBlank.setRefreshToken("   ");
        assertThrows(IllegalArgumentException.class, () -> authService.refreshAccessToken(reqBlank));
    }

    @Test
    void refreshAccessToken_tokenNotFound_throwsSecurityException() {
        RefreshTokenRequest req = new RefreshTokenRequest();
        req.setRefreshToken("nonexistent-token");

        when(refreshTokenService.findByToken("nonexistent-token")).thenReturn(Optional.empty());

        assertThrows(SecurityException.class, () -> authService.refreshAccessToken(req));
    }

    @Test
    void refreshAccessToken_validToken_rotatesAndGeneratesNewAccessToken() {
        RefreshTokenRequest req = new RefreshTokenRequest();
        req.setRefreshToken("valid-old-token");

        User user = new User();
        user.setId(15);
        user.setEmail("user@kimbia.africa");
        user.setRole(Role.RUNNER);

        RefreshToken oldToken = new RefreshToken();
        oldToken.setToken("valid-old-token");
        oldToken.setUser(user);

        RefreshToken rotatedToken = new RefreshToken();
        rotatedToken.setToken("new-rotated-token");
        rotatedToken.setUser(user);

        when(refreshTokenService.findByToken("valid-old-token")).thenReturn(Optional.of(oldToken));
        when(refreshTokenService.verifyExpiration(oldToken)).thenReturn(oldToken);
        when(refreshTokenService.rotateRefreshToken(oldToken)).thenReturn(rotatedToken);
        when(jwtService.generateToken(user)).thenReturn("new-jwt-access-token");

        AuthResponse response = authService.refreshAccessToken(req);

        assertNotNull(response);
        assertEquals("new-jwt-access-token", response.getToken());
        assertEquals("new-rotated-token", response.getRefreshToken());
        assertEquals(15, response.getUserId());
        assertEquals(Role.RUNNER, response.getRole());

        verify(refreshTokenService).rotateRefreshToken(oldToken);
    }

    @Test
    void logout_withToken_revokesToken() {
        RefreshTokenRequest req = new RefreshTokenRequest();
        req.setRefreshToken("logout-token");

        authService.logout(req);

        verify(refreshTokenService).revokeToken("logout-token");
    }

    @Test
    void logout_nullToken_doesNothing() {
        authService.logout(null);

        RefreshTokenRequest req = new RefreshTokenRequest();
        req.setRefreshToken(null);
        authService.logout(req);

        verify(refreshTokenService, never()).revokeToken(any());
    }
}
