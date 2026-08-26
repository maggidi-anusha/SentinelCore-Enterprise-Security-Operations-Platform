package com.example.sentinelcore.config;

import com.example.sentinelcore.entity.Role;
import com.example.sentinelcore.entity.User;
import com.example.sentinelcore.repository.RoleRepository;
import com.example.sentinelcore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() ->
                        roleRepository.save(
                                Role.builder()
                                        .name("ROLE_ADMIN")
                                        .build()
                        )
                );

        Role operatorRole = roleRepository.findByName("ROLE_OPERATOR")
                .orElseGet(() ->
                        roleRepository.save(
                                Role.builder()
                                        .name("ROLE_OPERATOR")
                                        .build()
                        )
                );

        Role viewerRole = roleRepository.findByName("ROLE_VIEWER")
                .orElseGet(() ->
                        roleRepository.save(
                                Role.builder()
                                        .name("ROLE_VIEWER")
                                        .build()
                        )
                );

        if (userRepository.findByUsername("admin").isEmpty()) {

            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("Admin@123"))
                    .email("admin@sentinelcore.local")
                    .roles(Set.of(adminRole))
                    .enabled(true)
                    .build();

            userRepository.save(admin);
        }

        if (userRepository.findByUsername("user").isEmpty()) {

            User viewer = User.builder()
                    .username("user")
                    .password(passwordEncoder.encode("User@123"))
                    .email("user@sentinelcore.local")
                    .roles(Set.of(viewerRole))
                    .enabled(true)
                    .build();

            userRepository.save(viewer);
        }
    }
}