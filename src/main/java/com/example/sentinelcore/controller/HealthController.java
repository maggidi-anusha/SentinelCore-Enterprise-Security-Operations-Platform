package com.example.sentinelcore.controller;

import com.example.sentinelcore.service.HealthMonitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final HealthMonitorService healthMonitorService;

    @GetMapping
    public String healthCheck() {
        return "SentinelCore backend is running";
    }
}