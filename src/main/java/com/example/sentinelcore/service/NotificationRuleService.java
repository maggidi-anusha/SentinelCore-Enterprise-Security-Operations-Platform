package com.example.sentinelcore.service;

import com.example.sentinelcore.dto.NotificationRuleDTO;
import com.example.sentinelcore.entity.Alert;
import com.example.sentinelcore.entity.NotificationRule;
import com.example.sentinelcore.repository.NotificationRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationRuleService {

    private final NotificationRuleRepository notificationRuleRepository;

    public NotificationRuleDTO createRule(NotificationRuleDTO dto) {

        NotificationRule rule = NotificationRule.builder()
                .ruleName(dto.getRuleName())
                .severity(
                        Alert.AlertSeverity.valueOf(dto.getSeverity())
                )
                .notificationType(dto.getNotificationType())
                .recipient(dto.getRecipient())
                .enabled(
                        dto.getEnabled() != null
                                ? dto.getEnabled()
                                : true
                )
                .build();

        return toDTO(notificationRuleRepository.save(rule));
    }

    public List<NotificationRuleDTO> getAllRules() {

        return notificationRuleRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public NotificationRuleDTO getRuleById(Long id) {

        NotificationRule rule =
                notificationRuleRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification rule not found with id: " + id
                                ));

        return toDTO(rule);
    }

    public List<NotificationRuleDTO> getRulesBySeverity(
            String severity) {

        Alert.AlertSeverity alertSeverity =
                Alert.AlertSeverity.valueOf(severity);

        return notificationRuleRepository
                .findBySeverity(alertSeverity)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public NotificationRuleDTO updateRule(
            Long id,
            NotificationRuleDTO dto) {

        NotificationRule rule =
                notificationRuleRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification rule not found with id: " + id
                                ));

        rule.setRuleName(dto.getRuleName());
        rule.setSeverity(
                Alert.AlertSeverity.valueOf(dto.getSeverity())
        );
        rule.setNotificationType(dto.getNotificationType());
        rule.setRecipient(dto.getRecipient());
        rule.setEnabled(dto.getEnabled());

        return toDTO(notificationRuleRepository.save(rule));
    }

    public void deleteRule(Long id) {

        if (!notificationRuleRepository.existsById(id)) {
            throw new RuntimeException(
                    "Notification rule not found with id: " + id
            );
        }

        notificationRuleRepository.deleteById(id);
    }

    private NotificationRuleDTO toDTO(
            NotificationRule rule) {

        return NotificationRuleDTO.builder()
                .id(rule.getId())
                .ruleName(rule.getRuleName())
                .severity(rule.getSeverity().name())
                .notificationType(rule.getNotificationType())
                .recipient(rule.getRecipient())
                .enabled(rule.getEnabled())
                .build();
    }
}