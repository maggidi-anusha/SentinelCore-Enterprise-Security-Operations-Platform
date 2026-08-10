package com.example.sentinelcore.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    private LocalDateTime createdAt;
}
