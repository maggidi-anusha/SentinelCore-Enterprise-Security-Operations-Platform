package com.example.sentinelcore.config;

import com.example.sentinelcore.entity.User;
import com.example.sentinelcore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        if (userRepository.findByUsername("admin").isEmpty()) {

            User user = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role("ADMIN")
                    .build();

            userRepository.save(user);

            System.out.println("Test admin user created.");
        }
    }
}