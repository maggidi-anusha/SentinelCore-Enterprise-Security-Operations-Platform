package com.example.sentinelcore.controller;

import com.example.sentinelcore.service.HealthMonitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final HealthMonitorService healthMonitorService;

    @PostMapping("/check")
    public String checkHealth() {
        healthMonitorService.checkAssetHealth();
        return "Health check completed successfully";
    }
}