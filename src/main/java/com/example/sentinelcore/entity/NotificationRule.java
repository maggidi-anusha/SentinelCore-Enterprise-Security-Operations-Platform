package com.example.sentinelcore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ruleName;

    @Enumerated(EnumType.STRING)
    private Alert.AlertSeverity severity;

    private String notificationType;

    private String recipient;

    @Builder.Default
    private Boolean enabled = true;
}