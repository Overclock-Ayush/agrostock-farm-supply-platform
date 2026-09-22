package com.ayush.agrostock.service;

import com.ayush.agrostock.domain.Role;
import com.ayush.agrostock.dto.AuthDtos;
import com.ayush.agrostock.exception.BadRequestException;
import com.ayush.agrostock.model.AppUser;
import com.ayush.agrostock.repository.UserRepository;
import com.ayush.agrostock.security.CustomUserDetailsService;
import com.ayush.agrostock.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       CustomUserDetailsService userDetailsService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.authenticationManager = authenticationManager;
    }

    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("An account with this email already exists.");
        }

        AppUser user = AppUser.builder()
                .name(request.name().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.BUYER)
                .build();

        userRepository.save(user);
        return issueToken(user);
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));

        AppUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadRequestException("Invalid credentials."));
        return issueToken(user);
    }

    private AuthDtos.AuthResponse issueToken(AppUser user) {
        UserDetails details = userDetailsService.loadUserByUsername(user.getEmail());
        return new AuthDtos.AuthResponse(
                jwtService.generateToken(details),
                new AuthDtos.UserView(user.getId(), user.getName(), user.getEmail(), user.getRole())
        );
    }
}
