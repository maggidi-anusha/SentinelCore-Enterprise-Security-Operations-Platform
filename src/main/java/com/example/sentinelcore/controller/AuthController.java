package com.example.sentinelcore.controller;

import com.example.sentinelcore.dto.LoginRequest;
import com.example.sentinelcore.dto.LoginResponse;
import com.example.sentinelcore.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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
}