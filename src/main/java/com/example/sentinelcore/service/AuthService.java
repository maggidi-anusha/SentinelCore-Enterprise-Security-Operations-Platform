package com.example.sentinelcore.service;

import com.example.sentinelcore.dto.LoginRequest;
import com.example.sentinelcore.dto.LoginResponse;
import com.example.sentinelcore.entity.User;
import com.example.sentinelcore.repository.UserRepository;
import com.example.sentinelcore.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException("Invalid username or password");
        }

        // Get the user's role from the Set<Role>
        String role = user.getRoles()
                .stream()
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("User has no assigned role"))
                .getName();

        String accessToken = jwtUtil.generateAccessToken(
                user.getUsername(),
                role
        );

        String refreshToken = jwtUtil.generateRefreshToken(
                user.getUsername()
        );

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .username(user.getUsername())
                .role(role)
                .build();
    }

    public String refreshAccessToken(String refreshToken) {

        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new RuntimeException(
                    "Invalid or expired refresh token"
            );
        }

        String username =
                jwtUtil.extractUsername(refreshToken);

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        String role = user.getRoles()
                .stream()
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException(
                                "User has no assigned role"
                        )
                )
                .getName();

        return jwtUtil.generateAccessToken(
                username,
                role
        );
    }
}