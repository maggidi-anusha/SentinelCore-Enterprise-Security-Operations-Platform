package com.example.sentinelcore.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetDTO {

    private Long id;

    private String assetName;

    private String assetType;

    private String ipAddress;

    private String location;

    private String address;

    private Double memoryUsage;

    private Double cpuUsage;

    private Double diskUsage;

    private Double networkUsage;

    private String createdAt;
}