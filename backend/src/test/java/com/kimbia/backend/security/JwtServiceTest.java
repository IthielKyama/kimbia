package com.kimbia.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collections;
import java.util.Date;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    // 256-bit (32 bytes) key encoded in Base64
    private static final String TEST_SECRET = Base64.getEncoder().encodeToString(
            "01234567890123456789012345678901".getBytes(StandardCharsets.UTF_8)
    );
    private static final long TEST_EXPIRATION = 900000L; // 15 minutes

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", TEST_SECRET);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", TEST_EXPIRATION);
    }

    private UserDetails createTestUser(String username) {
        return new User(username, "password", Collections.emptyList());
    }

    @Test
    void generateToken_withUserDetails_createsValidSignedToken() {
        UserDetails user = createTestUser("runner@kimbia.africa");

        String token = jwtService.generateToken(user);

        assertNotNull(token);
        assertFalse(token.isBlank());
        assertEquals("runner@kimbia.africa", jwtService.extractUsername(token));
    }

    @Test
    void generateToken_withExtraClaims_includesClaims() {
        UserDetails user = createTestUser("admin@kimbia.africa");
        Map<String, Object> extraClaims = Map.of("role", "SUPER_ADMIN", "customId", 42);

        String token = jwtService.generateToken(extraClaims, user);

        assertNotNull(token);
        assertEquals("SUPER_ADMIN", jwtService.extractClaim(token, claims -> claims.get("role", String.class)));
        Integer customId = jwtService.extractClaim(token, claims -> claims.get("customId", Integer.class));
        assertEquals(42, customId);
        assertEquals("admin@kimbia.africa", jwtService.extractUsername(token));
    }

    @Test
    void extractClaim_expirationResolver_returnsFutureDate() {
        UserDetails user = createTestUser("runner@kimbia.africa");
        String token = jwtService.generateToken(user);

        Date expiration = jwtService.extractClaim(token, Claims::getExpiration);

        assertNotNull(expiration);
        assertTrue(expiration.after(new Date()));
    }

    @Test
    void isTokenValid_matchingUserAndUnexpired_returnsTrue() {
        UserDetails user = createTestUser("runner@kimbia.africa");
        String token = jwtService.generateToken(user);

        boolean valid = jwtService.isTokenValid(token, user);

        assertTrue(valid);
    }

    @Test
    void isTokenValid_mismatchedUser_returnsFalse() {
        UserDetails userA = createTestUser("runnerA@kimbia.africa");
        UserDetails userB = createTestUser("runnerB@kimbia.africa");

        String tokenA = jwtService.generateToken(userA);

        boolean valid = jwtService.isTokenValid(tokenA, userB);

        assertFalse(valid);
    }

    @Test
    void expiredToken_parsingThrowsExpiredJwtException() {
        // Configure negative expiration to simulate immediate expiration
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", -1000L);

        UserDetails user = createTestUser("expired@kimbia.africa");
        String token = jwtService.generateToken(user);

        assertThrows(ExpiredJwtException.class, () -> jwtService.extractUsername(token));
    }
}
