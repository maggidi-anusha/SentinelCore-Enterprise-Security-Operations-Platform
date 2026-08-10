package com.example.sentinelcore.service;

import com.example.sentinelcore.dto.HealthStatusDTO;
import com.example.sentinelcore.entity.Asset;
import com.example.sentinelcore.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HealthMonitoringService {

    private final AssetRepository assetRepository;

    public HealthStatusDTO checkHealth(Long assetId) {

        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Asset not found with id: " + assetId
                        )
                );

        long startTime = System.currentTimeMillis();

        boolean reachable = false;

        try {

            reachable = java.net.InetAddress
                    .getByName(asset.getIpAddress())
                    .isReachable(3000);

        } catch (Exception e) {

            reachable = false;
        }

        long responseTime =
                System.currentTimeMillis() - startTime;

        Asset.AssetStatus status =
                reachable
                        ? Asset.AssetStatus.ONLINE
                        : Asset.AssetStatus.OFFLINE;

        asset.setStatus(status);

        assetRepository.save(asset);

        return HealthStatusDTO.builder()
                .assetId(asset.getId())
                .assetName(asset.getAssetName())
                .ipAddress(asset.getIpAddress())
                .status(status.name())
                .responseTimeMs(responseTime)
                .build();
    }
}
