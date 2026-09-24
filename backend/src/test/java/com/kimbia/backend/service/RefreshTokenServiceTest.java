package com.kimbia.backend.service;

import com.kimbia.backend.entity.RefreshToken;
import com.kimbia.backend.entity.User;
import com.kimbia.backend.repository.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        refreshTokenService = new RefreshTokenService(refreshTokenRepository);
        ReflectionTestUtils.setField(refreshTokenService, "refreshExpirationMs", 2592000000L);
    }

    @Test
    void createRefreshToken_setsUserUuidExpirationAndNotRevoked() {
        User user = new User();
        user.setId(1);
        user.setEmail("user@kimbia.africa");

        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        RefreshToken token = refreshTokenService.createRefreshToken(user);

        assertNotNull(token);
        assertEquals(user, token.getUser());
        assertNotNull(token.getToken());
        assertFalse(token.isRevoked());
        assertTrue(token.getExpiryDate().isAfter(Instant.now()));
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void findByToken_delegatesToRepository() {
        RefreshToken token = new RefreshToken();
        token.setToken("sample-token");
        when(refreshTokenRepository.findByToken("sample-token")).thenReturn(Optional.of(token));

        Optional<RefreshToken> result = refreshTokenService.findByToken("sample-token");
        assertTrue(result.isPresent());
        assertEquals("sample-token", result.get().getToken());
    }

    @Test
    void verifyExpiration_revokedToken_deletesAndThrowsSecurityException() {
        RefreshToken token = new RefreshToken();
        token.setRevoked(true);

        assertThrows(SecurityException.class, () -> refreshTokenService.verifyExpiration(token));
        verify(refreshTokenRepository).delete(token);
    }

    @Test
    void verifyExpiration_expiredToken_deletesAndThrowsSecurityException() {
        RefreshToken token = new RefreshToken();
        token.setRevoked(false);
        token.setExpiryDate(Instant.now().minusSeconds(3600));

        assertThrows(SecurityException.class, () -> refreshTokenService.verifyExpiration(token));
        verify(refreshTokenRepository).delete(token);
    }

    @Test
    void verifyExpiration_validToken_returnsToken() {
        RefreshToken token = new RefreshToken();
        token.setRevoked(false);
        token.setExpiryDate(Instant.now().plusSeconds(3600));

        RefreshToken result = refreshTokenService.verifyExpiration(token);
        assertSame(token, result);
        verify(refreshTokenRepository, never()).delete(any());
    }

    @Test
    void rotateRefreshToken_deletesOldAndIssuesNew() {
        User user = new User();
        user.setId(1);
        user.setEmail("user@kimbia.africa");

        RefreshToken oldToken = new RefreshToken();
        oldToken.setUser(user);
        oldToken.setToken("old-token");

        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        RefreshToken newToken = refreshTokenService.rotateRefreshToken(oldToken);

        assertNotNull(newToken);
        assertEquals(user, newToken.getUser());
        assertNotEquals("old-token", newToken.getToken());
        verify(refreshTokenRepository).delete(oldToken);
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void revokeToken_exists_marksRevokedAndDeletes() {
        User user = new User();
        user.setEmail("user@kimbia.africa");

        RefreshToken token = new RefreshToken();
        token.setToken("to-revoke");
        token.setUser(user);
        token.setRevoked(false);

        when(refreshTokenRepository.findByToken("to-revoke")).thenReturn(Optional.of(token));

        refreshTokenService.revokeToken("to-revoke");

        assertTrue(token.isRevoked());
        verify(refreshTokenRepository).delete(token);
    }

    @Test
    void revokeToken_nullOrBlank_doesNothing() {
        refreshTokenService.revokeToken(null);
        refreshTokenService.revokeToken("   ");

        verify(refreshTokenRepository, never()).findByToken(any());
        verify(refreshTokenRepository, never()).delete(any());
    }

    @Test
    void revokeAllUserTokens_delegatesToDeleteByUser() {
        User user = new User();
        user.setId(10);

        refreshTokenService.revokeAllUserTokens(user);

        verify(refreshTokenRepository).deleteByUser(user);
    }
}
