package com.example.sentinelcore.service;

import com.example.sentinelcore.dto.AssetDTO;
import com.example.sentinelcore.dto.DashboardSummaryDTO;
import com.example.sentinelcore.entity.Asset;
import com.example.sentinelcore.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.sentinelcore.repository.AssetSpecification;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;

    public List<AssetDTO> getAllAssets() {
        return assetRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public AssetDTO getAssetById(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Asset not found with id: " + id));

        return toDTO(asset);
    }

    public List<AssetDTO> getAssetsByType(String assetType) {
        return assetRepository.findByAssetType(assetType)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public AssetDTO createAsset(AssetDTO dto) {

        Asset asset = Asset.builder()
                .assetName(dto.getAssetName())
                .assetType(dto.getAssetType())
                .ipAddress(dto.getIpAddress())
                .location(dto.getLocation())
                .address(dto.getAddress())
                .memoryUsage(dto.getMemoryUsage())
                .cpuUsage(dto.getCpuUsage())
                .diskUsage(dto.getDiskUsage())
                .networkUsage(dto.getNetworkUsage())
                .status(
                        dto.getStatus() != null
                                ? Asset.AssetStatus.valueOf(dto.getStatus().toUpperCase())
                                : Asset.AssetStatus.ONLINE
                )
                .createdAt(LocalDateTime.now())
                .build();

        Asset savedAsset = assetRepository.save(asset);

        return toDTO(savedAsset);
    }

    public AssetDTO updateAsset(Long id, AssetDTO dto) {

        Asset asset = assetRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Asset not found with id: " + id));

        asset.setAssetName(dto.getAssetName());
        asset.setAssetType(dto.getAssetType());
        asset.setIpAddress(dto.getIpAddress());
        asset.setLocation(dto.getLocation());
        asset.setAddress(dto.getAddress());
        asset.setMemoryUsage(dto.getMemoryUsage());
        asset.setCpuUsage(dto.getCpuUsage());
        asset.setDiskUsage(dto.getDiskUsage());
        asset.setNetworkUsage(dto.getNetworkUsage());
        asset.setStatus(
                dto.getStatus() != null
                        ? Asset.AssetStatus.valueOf(dto.getStatus().toUpperCase())
                        : Asset.AssetStatus.ONLINE
        );
        Asset updatedAsset = assetRepository.save(asset);

        return toDTO(updatedAsset);
    }

    public void deleteAsset(Long id) {

        if (!assetRepository.existsById(id)) {
            throw new RuntimeException("Asset not found with id: " + id);
        }
        assetRepository.deleteById(id);
    }

    public DashboardSummaryDTO getDashboardSummary() {

        List<Asset> all = assetRepository.findAll();

        long total = all.size();

        long online = all.stream()
                .filter(a -> a.getStatus() == Asset.AssetStatus.ONLINE)
                .count();

        long critical = all.stream()
                .filter(a -> a.getStatus() == Asset.AssetStatus.CRITICAL)
                .count();

        long monitored = online + critical;

        double uptime = monitored == 0
                ? 0
                : (online * 100.0) / monitored;

        double avgCpu = all.stream()
                .filter(a -> a.getCpuUsage() != null)
                .mapToDouble(Asset::getCpuUsage)
                .average()
                .orElse(0);

        double avgMemory = all.stream()
                .filter(a -> a.getMemoryUsage() != null)
                .mapToDouble(Asset::getMemoryUsage)
                .average()
                .orElse(0);

        return DashboardSummaryDTO.builder()
                .totalAssets(total)
                .uptimePercentage(uptime)
                .onlineAssets(online)
                .offlineAssets(critical)
                .criticalAlerts(0L)
                .avgCpuUsage(avgCpu)
                .avgMemoryUsage(avgMemory)
                .build();
    }

    private AssetDTO toDTO(Asset asset) {

        return AssetDTO.builder()
                .id(asset.getId())
                .assetName(asset.getAssetName())
                .assetType(asset.getAssetType())
                .ipAddress(asset.getIpAddress())
                .location(asset.getLocation())
                .address(asset.getAddress())
                .memoryUsage(asset.getMemoryUsage())
                .cpuUsage(asset.getCpuUsage())
                .diskUsage(asset.getDiskUsage())
                .networkUsage(asset.getNetworkUsage())
                .status(
                        asset.getStatus() != null
                                ? asset.getStatus().name()
                                : null
                )
                .createdAt(
                        asset.getCreatedAt() != null
                                ? asset.getCreatedAt().toString()
                                : null
                )
                .build();
    }

    public List<AssetDTO> searchAssets(String search) {

        Specification<Asset> specification =
                AssetSpecification.searchAssets(search);

        List<Asset> assets;

        if (specification == null) {

            assets = assetRepository.findAll();

        } else {

            assets = assetRepository.findAll(
                    specification
            );
        }

        return assets.stream()
                .map(this::toDTO)
                .toList();
    }
}
