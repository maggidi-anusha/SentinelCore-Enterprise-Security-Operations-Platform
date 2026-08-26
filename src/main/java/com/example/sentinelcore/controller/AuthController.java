package com.example.sentinelcore.controller;

import com.example.sentinelcore.dto.LoginRequest;
import com.example.sentinelcore.dto.LoginResponse;
import com.example.sentinelcore.service.AuthService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public Map<String, String> refresh(
            @RequestBody Map<String, String> body) {

        String refreshToken =
                body.get("refreshToken");

        String newAccessToken =
                authService.refreshAccessToken(
                        refreshToken
                );

        return Map.of(
                "accessToken",
                newAccessToken
        );
    }
}

