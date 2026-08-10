package com.example.sentinelcore.controller;

import com.example.sentinelcore.dto.HealthStatusDTO;
import com.example.sentinelcore.service.HealthMonitoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@CrossOrigin
public class HealthController {

    private final HealthMonitoringService healthMonitoringService;

    @GetMapping("/{assetId}")
    public HealthStatusDTO checkHealth(
            @PathVariable Long assetId) {

        return healthMonitoringService.checkHealth(assetId);
    }
}