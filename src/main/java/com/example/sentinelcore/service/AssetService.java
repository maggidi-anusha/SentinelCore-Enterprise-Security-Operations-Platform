package com.example.sentinelcore.service;

import com.example.sentinelcore.dto.AssetDTO;
import com.example.sentinelcore.entity.Asset;
import com.example.sentinelcore.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

        Asset updatedAsset = assetRepository.save(asset);

        return toDTO(updatedAsset);
    }

    public void deleteAsset(Long id) {

        if (!assetRepository.existsById(id)) {
            throw new RuntimeException("Asset not found with id: " + id);
        }
        assetRepository.deleteById(id);
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
                .createdAt(
                        asset.getCreatedAt() != null
                                ? asset.getCreatedAt().toString()
                                : null
                )
                .build();
    }
}
