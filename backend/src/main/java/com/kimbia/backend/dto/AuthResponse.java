package com.kimbia.backend.dto;

import com.kimbia.backend.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String accessToken;
    private String refreshToken;
    private Integer userId;
    private Role role;

    public AuthResponse(String token, Integer userId, Role role) {
        this.token = token;
        this.accessToken = token;
        this.userId = userId;
        this.role = role;
    }

    public AuthResponse(String token, String refreshToken, Integer userId, Role role) {
        this.token = token;
        this.accessToken = token;
        this.refreshToken = refreshToken;
        this.userId = userId;
        this.role = role;
    }
}
