package com.example.sentinelcore.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRuleDTO {

    private Long id;

    private String ruleName;

    private String severity;

    private String notificationType;

    private String recipient;

    private Boolean enabled;
}
