package com.example.sentinelcore.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertDTO {

    private Long id;

    private Long assetId;

    private String assetName;

    private String severity;

    private String message;

    private String status;

    private String createdAt;

    private String resolvedAt;
}