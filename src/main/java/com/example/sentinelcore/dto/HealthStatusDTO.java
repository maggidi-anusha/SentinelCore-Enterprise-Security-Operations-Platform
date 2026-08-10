package com.example.sentinelcore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class HealthStatusDTO {

    private Long assetId;

    private String assetName;

    private String ipAddress;

    private String status;

    private long responseTimeMs;

}