package com.ayush.agrostock.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {
    private final JwtService jwtService = new JwtService(
            "test-secret-that-is-definitely-long-enough-for-hs256-signing",
            60);

    @Test
    void tokenContainsUsernameAndValidates() {
        UserDetails user = User.withUsername("buyer@example.com")
                .password("ignored")
                .roles("BUYER")
                .build();

        String token = jwtService.generateToken(user);
        assertEquals("buyer@example.com", jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, user));
    }
}
