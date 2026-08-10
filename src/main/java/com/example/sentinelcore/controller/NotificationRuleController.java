package com.example.sentinelcore.controller;

import com.example.sentinelcore.dto.NotificationRuleDTO;
import com.example.sentinelcore.service.NotificationRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notification-rules")
@RequiredArgsConstructor
@CrossOrigin
public class NotificationRuleController {

    private final NotificationRuleService notificationRuleService;

    @PostMapping
    public NotificationRuleDTO createRule(
            @RequestBody NotificationRuleDTO dto) {

        return notificationRuleService.createRule(dto);
    }

    @GetMapping
    public List<NotificationRuleDTO> getAllRules() {

        return notificationRuleService.getAllRules();
    }

    @GetMapping("/{id}")
    public NotificationRuleDTO getRuleById(
            @PathVariable Long id) {

        return notificationRuleService.getRuleById(id);
    }

    @GetMapping("/severity/{severity}")
    public List<NotificationRuleDTO> getRulesBySeverity(
            @PathVariable String severity) {

        return notificationRuleService
                .getRulesBySeverity(severity);
    }

    @PutMapping("/{id}")
    public NotificationRuleDTO updateRule(
            @PathVariable Long id,
            @RequestBody NotificationRuleDTO dto) {

        return notificationRuleService.updateRule(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteRule(@PathVariable Long id) {

        notificationRuleService.deleteRule(id);
    }
}
