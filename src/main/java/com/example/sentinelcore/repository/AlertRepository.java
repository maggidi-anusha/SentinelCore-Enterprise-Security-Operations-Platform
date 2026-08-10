package com.example.sentinelcore.repository;

import com.example.sentinelcore.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByAssetId(Long assetId);

    List<Alert> findByStatus(Alert.AlertStatus status);

    List<Alert> findBySeverity(Alert.AlertSeverity severity);
}