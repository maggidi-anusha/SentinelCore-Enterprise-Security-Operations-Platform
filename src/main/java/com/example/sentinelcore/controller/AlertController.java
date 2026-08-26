package com.example.sentinelcore.controller;

import com.example.sentinelcore.dto.AlertDTO;
import com.example.sentinelcore.entity.Alert;
import com.example.sentinelcore.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@CrossOrigin
public class AlertController {

    private final AlertService alertService;

    @PostMapping
    public AlertDTO createAlert(
            @RequestParam Long assetId,
            @RequestParam String severity,
            @RequestParam String message) {

        return alertService.createAlert(
                assetId,
                Alert.AlertSeverity.valueOf(severity.toUpperCase()),
                message
        );
    }

    @GetMapping
    public List<AlertDTO> getAllAlerts() {
        return alertService.getAllAlerts();
    }

    @GetMapping("/open")
    public List<AlertDTO> getOpenAlerts() {
        return alertService.getOpenAlerts();
    }

    @GetMapping("/{id}")
    public AlertDTO getAlertById(@PathVariable Long id) {
        return alertService.getAlertById(id);
    }

    @GetMapping("/asset/{assetId}")
    public List<AlertDTO> getAlertsByAsset(
            @PathVariable Long assetId) {
        return alertService.getAlertsByAsset(assetId);
    }

    @PutMapping("/{id}/acknowledge")
    public AlertDTO acknowledgeAlert(@PathVariable Long id) {
        return alertService.acknowledgeAlert(id);
    }

    @PutMapping("/{id}/resolve")
    public AlertDTO resolveAlert(@PathVariable Long id) {
        return alertService.resolveAlert(id);
    }
}