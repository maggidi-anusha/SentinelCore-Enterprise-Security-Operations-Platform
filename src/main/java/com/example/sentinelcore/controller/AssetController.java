package com.example.sentinelcore.controller;

import com.example.sentinelcore.dto.AssetDTO;
import com.example.sentinelcore.dto.DashboardSummaryDTO;
import com.example.sentinelcore.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
@CrossOrigin
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    public List<AssetDTO> getAllAssets() {
        return assetService.getAllAssets();
    }

    @GetMapping("/dashboard/summary")
    public DashboardSummaryDTO getDashboardSummary() {
        return assetService.getDashboardSummary();
    }

    @GetMapping("/{id}")
    public AssetDTO getAssetById(@PathVariable Long id) {
        return assetService.getAssetById(id);
    }

    @GetMapping("/type/{assetType}")
    public List<AssetDTO> getAssetsByType(
            @PathVariable String assetType) {

        return assetService.getAssetsByType(assetType);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public AssetDTO createAsset(@RequestBody AssetDTO dto) {
        return assetService.createAsset(dto);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public AssetDTO updateAsset(
            @PathVariable Long id,
            @RequestBody AssetDTO dto) {

        return assetService.updateAsset(id, dto);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
    }

}