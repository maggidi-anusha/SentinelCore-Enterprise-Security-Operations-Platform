package com.example.sentinelcore.service;

import com.example.sentinelcore.entity.Asset;
import com.example.sentinelcore.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HealthMonitorService {

    private final AssetRepository assetRepository;
    private final AlertService alertService;

    private static final double CPU_CRITICAL_THRESHOLD = 90.0;
    private static final double MEMORY_WARNING_THRESHOLD = 80.0;

    @Scheduled(fixedRate = 60000)
    public void checkAssetHealth() {

        List<Asset> assets = assetRepository.findAll();

        for (Asset asset : assets) {

            if (asset.getCpuUsage() != null &&
                    asset.getCpuUsage() >= CPU_CRITICAL_THRESHOLD) {

                asset.setStatus(Asset.AssetStatus.CRITICAL);

                if (!alertService.hasOpenAlert(asset.getId())) {

                    alertService.createAlert(
                            asset.getId(),
                            "CRITICAL",
                            "CPU usage critical: "
                                    + asset.getCpuUsage() + "%"
                    );
                }

            } else if (asset.getMemoryUsage() != null &&
                    asset.getMemoryUsage() >= MEMORY_WARNING_THRESHOLD) {

                asset.setStatus(Asset.AssetStatus.WARNING);

                if (!alertService.hasOpenAlert(asset.getId())) {

                    alertService.createAlert(
                            asset.getId(),
                            "MEDIUM",
                            "Memory usage high: "
                                    + asset.getMemoryUsage() + "%"
                    );
                }

            } else {

                asset.setStatus(Asset.AssetStatus.ONLINE);
            }

            assetRepository.save(asset);
        }
    }
}