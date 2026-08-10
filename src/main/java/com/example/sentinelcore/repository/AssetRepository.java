package com.example.sentinelcore.repository;

import com.example.sentinelcore.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetRepository extends JpaRepository<Asset, Long> {

    List<Asset> findByAssetType(String assetType);
}