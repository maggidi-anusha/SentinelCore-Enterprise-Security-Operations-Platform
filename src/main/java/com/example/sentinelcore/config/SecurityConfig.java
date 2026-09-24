package com.example.sentinelcore.config;

import com.example.sentinelcore.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

                .csrf(csrf ->
                        csrf.disable()
                )

                .cors(cors -> {})

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // AUTHENTICATION

                        .requestMatchers(
                                "/api/auth/**"
                        )
                        .permitAll()


                        // NOTIFICATION RULES
                        // ADMIN ONLY

                        .requestMatchers(
                                "/api/notification-rules/**"
                        )
                        .hasRole("ADMIN")


                        // ASSETS - READ
                        // USER + ADMIN

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/assets/**"
                        )
                        .hasAnyRole(
                                "VIEWER",
                                "ADMIN"
                        )



                        // ASSETS - CREATE
                        // ADMIN ONLY

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/assets"
                        )
                        .hasRole("ADMIN")


                        // ASSETS - UPDATE
                        // ADMIN ONLY

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/assets/**"
                        )
                        .hasRole("ADMIN")


                        // ASSETS - DELETE
                        // ADMIN ONLY

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/assets/**"
                        )
                        .hasRole("ADMIN")


// ALERTS - READ
// VIEWER + ADMIN

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/alerts/**"
                                )
                                .hasAnyRole(
                                        "VIEWER",
                                        "ADMIN"
                                )


// ALERTS - CREATE
// ADMIN ONLY


                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/alerts/**"
                                )
                                .hasRole("ADMIN")


// ---------------------------
// ALERTS - UPDATE / RESOLVE
// ADMIN ONLY
// ---------------------------

                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/alerts/**"
                                )
                                .hasRole("ADMIN")


                        // INCIDENTS - READ: VIEWER + OPERATOR + ADMIN
                        //             CREATE / ASSIGN / STATUS: OPERATOR + ADMIN
                        //             DELETE: ADMIN ONLY

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/incidents/**"
                        )
                        .hasAnyRole("VIEWER", "OPERATOR", "ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/incidents/**"
                        )
                        .hasAnyRole("OPERATOR", "ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/incidents/**"
                        )
                        .hasAnyRole("OPERATOR", "ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/incidents/**"
                        )
                        .hasRole("ADMIN")


                        // VULNERABILITIES - READ: VIEWER + OPERATOR + ADMIN
                        //                   REPORT / PATCH: OPERATOR + ADMIN

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/vulnerabilities/**"
                        )
                        .hasAnyRole("VIEWER", "OPERATOR", "ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/vulnerabilities/**"
                        )
                        .hasAnyRole("OPERATOR", "ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/vulnerabilities/**"
                        )
                        .hasAnyRole("OPERATOR", "ADMIN")


                        // AUDIT LOGS - ADMIN ONLY (read + append, never edit/delete)

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/audit/**"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/audit"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                "/api/audit/**"
                        )
                        .denyAll()


                        // COMPLIANCE - READ: VIEWER + OPERATOR + ADMIN
                        //              RECORD CHECK: ADMIN ONLY

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/compliance/**"
                        )
                        .hasAnyRole("VIEWER", "OPERATOR", "ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/compliance/**"
                        )
                        .hasRole("ADMIN")


                        // All remaining APIs
                        // require authentication
                        .anyRequest()
                        .authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:5174",
                "https://cloudsecuritymonitoringsystem.netlify.app"
        ));

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(
                true
        );

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}