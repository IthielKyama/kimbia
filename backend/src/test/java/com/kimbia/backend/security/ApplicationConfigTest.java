package com.kimbia.backend.security;

import com.kimbia.backend.entity.User;
import com.kimbia.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationConfigTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthenticationConfiguration authenticationConfiguration;

    @Mock
    private AuthenticationManager authenticationManager;

    private ApplicationConfig applicationConfig;

    @BeforeEach
    void setUp() {
        applicationConfig = new ApplicationConfig(userRepository);
    }

    @Test
    void userDetailsService_userExists_returnsUserDetails() {
        User user = new User();
        user.setEmail("runner@kimbia.africa");
        user.setPasswordHash("hashed_pwd");

        when(userRepository.findByEmail("runner@kimbia.africa")).thenReturn(Optional.of(user));

        UserDetailsService userDetailsService = applicationConfig.userDetailsService();
        UserDetails result = userDetailsService.loadUserByUsername("runner@kimbia.africa");

        assertNotNull(result);
        assertEquals("runner@kimbia.africa", result.getUsername());
    }

    @Test
    void userDetailsService_userNotFound_throwsUsernameNotFoundException() {
        when(userRepository.findByEmail("missing@kimbia.africa")).thenReturn(Optional.empty());

        UserDetailsService userDetailsService = applicationConfig.userDetailsService();

        assertThrows(UsernameNotFoundException.class, () ->
                userDetailsService.loadUserByUsername("missing@kimbia.africa"));
    }

    @Test
    void passwordEncoder_encodesAndMatches() {
        PasswordEncoder encoder = applicationConfig.passwordEncoder();
        assertNotNull(encoder);

        String raw = "mySecretPassword123";
        String encoded = encoder.encode(raw);

        assertNotNull(encoded);
        assertNotEquals(raw, encoded);
        assertTrue(encoder.matches(raw, encoded));
        assertFalse(encoder.matches("wrongPassword", encoded));
    }

    @Test
    void authenticationManager_delegatesToConfiguration() throws Exception {
        when(authenticationConfiguration.getAuthenticationManager()).thenReturn(authenticationManager);

        AuthenticationManager result = applicationConfig.authenticationManager(authenticationConfiguration);

        assertSame(authenticationManager, result);
        verify(authenticationConfiguration).getAuthenticationManager();
    }
}
