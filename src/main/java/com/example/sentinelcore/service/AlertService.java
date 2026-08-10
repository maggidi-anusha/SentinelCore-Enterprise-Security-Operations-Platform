package com.example.sentinelcore.service;

import com.example.sentinelcore.dto.AlertDTO;
import com.example.sentinelcore.entity.Alert;
import com.example.sentinelcore.entity.Asset;
import com.example.sentinelcore.repository.AlertRepository;
import com.example.sentinelcore.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final AssetRepository assetRepository;

    public AlertDTO createAlert(AlertDTO dto) {

        Asset asset = assetRepository.findById(dto.getAssetId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Asset not found with id: " + dto.getAssetId()
                        ));

        Alert alert = Alert.builder()
                .asset(asset)
                .severity(Alert.AlertSeverity.valueOf(dto.getSeverity()))
                .message(dto.getMessage())
                .status(Alert.AlertStatus.OPEN)
                .createdAt(LocalDateTime.now())
                .build();

        return toDTO(alertRepository.save(alert));
    }

    public List<AlertDTO> getAllAlerts() {

        return alertRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public AlertDTO getAlertById(Long id) {

        Alert alert = alertRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Alert not found with id: " + id
                        ));

        return toDTO(alert);
    }

    public List<AlertDTO> getAlertsByAsset(Long assetId) {

        return alertRepository.findByAssetId(assetId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public AlertDTO acknowledgeAlert(Long id) {

        Alert alert = getAlertEntity(id);

        if (alert.getStatus() == Alert.AlertStatus.RESOLVED) {
            throw new RuntimeException(
                    "Resolved alert cannot be acknowledged"
            );
        }

        alert.setStatus(Alert.AlertStatus.ACKNOWLEDGED);

        return toDTO(alertRepository.save(alert));
    }

    public AlertDTO resolveAlert(Long id) {

        Alert alert = getAlertEntity(id);

        alert.setStatus(Alert.AlertStatus.RESOLVED);
        alert.setResolvedAt(LocalDateTime.now());

        return toDTO(alertRepository.save(alert));
    }

    private Alert getAlertEntity(Long id) {

        return alertRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Alert not found with id: " + id
                        ));
    }

    private AlertDTO toDTO(Alert alert) {

        return AlertDTO.builder()
                .id(alert.getId())
                .assetId(alert.getAsset().getId())
                .assetName(alert.getAsset().getAssetName())
                .severity(alert.getSeverity().name())
                .message(alert.getMessage())
                .status(alert.getStatus().name())
                .createdAt(
                        alert.getCreatedAt() != null
                                ? alert.getCreatedAt().toString()
                                : null
                )
                .resolvedAt(
                        alert.getResolvedAt() != null
                                ? alert.getResolvedAt().toString()
                                : null
                )
                .build();
    }
}
