package com.kimbia.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private FilterChain filterChain;

    private JwtAuthenticationFilter jwtAuthenticationFilter;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        jwtAuthenticationFilter = new JwtAuthenticationFilter(jwtService, userDetailsService);
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_noAuthorizationHeader_passesWithoutAuth() throws ServletException, IOException {
        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verifyNoInteractions(jwtService);
        verifyNoInteractions(userDetailsService);
    }

    @Test
    void doFilterInternal_nonBearerHeader_passesWithoutAuth() throws ServletException, IOException {
        request.addHeader("Authorization", "Basic dXNlcjpwYXNz");

        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verifyNoInteractions(jwtService);
        verifyNoInteractions(userDetailsService);
    }

    @Test
    void doFilterInternal_malformedJwt_passesWithoutAuth() throws ServletException, IOException {
        request.addHeader("Authorization", "Bearer invalid-token");

        when(jwtService.extractUsername("invalid-token")).thenThrow(new RuntimeException("JWT malformed"));

        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verifyNoInteractions(userDetailsService);
    }

    @Test
    void doFilterInternal_validTokenAndNoExistingAuth_setsSecurityContextAuth() throws ServletException, IOException {
        request.addHeader("Authorization", "Bearer valid-jwt");

        when(jwtService.extractUsername("valid-jwt")).thenReturn("runner@kimbia.africa");

        UserDetails userDetails = new User(
                "runner@kimbia.africa",
                "secret",
                List.of(new SimpleGrantedAuthority("ROLE_RUNNER"))
        );
        when(userDetailsService.loadUserByUsername("runner@kimbia.africa")).thenReturn(userDetails);
        when(jwtService.isTokenValid("valid-jwt", userDetails)).thenReturn(true);

        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertEquals("runner@kimbia.africa", auth.getName());
        assertTrue(auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_RUNNER")));
    }

    @Test
    void doFilterInternal_existingAuthInContext_doesNotOverwrite() throws ServletException, IOException {
        Authentication existingAuth = new UsernamePasswordAuthenticationToken("existing@kimbia.africa", null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(existingAuth);

        request.addHeader("Authorization", "Bearer valid-jwt");
        when(jwtService.extractUsername("valid-jwt")).thenReturn("runner@kimbia.africa");

        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertSame(existingAuth, SecurityContextHolder.getContext().getAuthentication());
        verifyNoInteractions(userDetailsService);
    }

    @Test
    void doFilterInternal_invalidToken_doesNotSetAuth() throws ServletException, IOException {
        request.addHeader("Authorization", "Bearer expired-jwt");

        when(jwtService.extractUsername("expired-jwt")).thenReturn("runner@kimbia.africa");

        UserDetails userDetails = new User("runner@kimbia.africa", "secret", Collections.emptyList());
        when(userDetailsService.loadUserByUsername("runner@kimbia.africa")).thenReturn(userDetails);
        when(jwtService.isTokenValid("expired-jwt", userDetails)).thenReturn(false);

        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
