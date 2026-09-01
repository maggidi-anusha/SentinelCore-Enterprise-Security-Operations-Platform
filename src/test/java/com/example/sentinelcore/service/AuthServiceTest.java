package com.example.sentinelcore.service;

import com.example.sentinelcore.dto.LoginRequest;
import com.example.sentinelcore.dto.LoginResponse;
import com.example.sentinelcore.entity.Role;
import com.example.sentinelcore.entity.User;
import com.example.sentinelcore.repository.UserRepository;
import com.example.sentinelcore.util.JwtUtil;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;


    // ------------------------------------------------
    // TEST 1 - VALID LOGIN
    // ------------------------------------------------

    @Test
    void testLoginWithValidCredentials() {

        // Arrange

        LoginRequest request =
                mock(LoginRequest.class);

        when(request.getUsername())
                .thenReturn("admin");

        when(request.getPassword())
                .thenReturn("Admin@123");


        Role adminRole = Role.builder()
                .id(1L)
                .name("ROLE_ADMIN")
                .build();


        User user = User.builder()
                .id(1L)
                .username("admin")
                .password("encodedPassword")
                .roles(Set.of(adminRole))
                .enabled(true)
                .build();


        when(userRepository.findByUsername("admin"))
                .thenReturn(Optional.of(user));


        when(passwordEncoder.matches(
                "Admin@123",
                "encodedPassword"
        )).thenReturn(true);


        when(jwtUtil.generateAccessToken(
                "admin",
                "ROLE_ADMIN"
        )).thenReturn("testAccessToken");


        when(jwtUtil.generateRefreshToken(
                "admin"
        )).thenReturn("testRefreshToken");


        // Act

        LoginResponse response =
                authService.login(request);


        // Assert

        assertNotNull(response);

        assertEquals(
                "admin",
                response.getUsername()
        );

        assertEquals(
                "ROLE_ADMIN",
                response.getRole()
        );

        assertEquals(
                "testAccessToken",
                response.getAccessToken()
        );

        assertEquals(
                "testRefreshToken",
                response.getRefreshToken()
        );


        verify(userRepository)
                .findByUsername("admin");

        verify(passwordEncoder)
                .matches(
                        "Admin@123",
                        "encodedPassword"
                );

        verify(jwtUtil)
                .generateAccessToken(
                        "admin",
                        "ROLE_ADMIN"
                );
    }


    // ------------------------------------------------
    // TEST 2 - INVALID PASSWORD
    // ------------------------------------------------

    @Test
    void testLoginWithInvalidPassword() {

        // Arrange

        LoginRequest request =
                mock(LoginRequest.class);

        when(request.getUsername())
                .thenReturn("admin");

        when(request.getPassword())
                .thenReturn("wrongPassword");


        User user = User.builder()
                .id(1L)
                .username("admin")
                .password("encodedPassword")
                .enabled(true)
                .build();


        when(userRepository.findByUsername("admin"))
                .thenReturn(Optional.of(user));


        when(passwordEncoder.matches(
                "wrongPassword",
                "encodedPassword"
        )).thenReturn(false);


        // Act + Assert

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> authService.login(request)
                );


        assertEquals(
                "Invalid username or password",
                exception.getMessage()
        );


        // JWT should NOT be generated
        verify(
                jwtUtil,
                never()
        ).generateAccessToken(
                anyString(),
                anyString()
        );


        verify(
                jwtUtil,
                never()
        ).generateRefreshToken(
                anyString()
        );
    }
}