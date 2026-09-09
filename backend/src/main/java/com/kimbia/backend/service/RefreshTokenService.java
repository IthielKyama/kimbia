package com.kimbia.backend.service;

import com.kimbia.backend.entity.RefreshToken;
import com.kimbia.backend.entity.User;
import com.kimbia.backend.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    @Value("${jwt.refresh-expiration:2592000000}")
    private long refreshExpirationMs; // Default 30 days in ms

    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshExpirationMs))
                .revoked(false)
                .createdAt(Instant.now())
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.isRevoked()) {
            refreshTokenRepository.delete(token);
            throw new SecurityException("Refresh token has been revoked. Please sign in again.");
        }

        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new SecurityException("Refresh token has expired. Please sign in again.");
        }

        return token;
    }

    @Transactional
    public RefreshToken rotateRefreshToken(RefreshToken oldToken) {
        User user = oldToken.getUser();
        // Invalidate the old token to prevent replay attacks
        refreshTokenRepository.delete(oldToken);

        // Issue a fresh rotated token
        return createRefreshToken(user);
    }

    @Transactional
    public void revokeToken(String tokenStr) {
        if (tokenStr == null || tokenStr.trim().isEmpty()) {
            return;
        }
        refreshTokenRepository.findByToken(tokenStr.trim()).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.delete(token);
            log.info("Revoked refresh token for user: {}", token.getUser().getEmail());
        });
    }

    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.deleteByUser(user);
    }
}
