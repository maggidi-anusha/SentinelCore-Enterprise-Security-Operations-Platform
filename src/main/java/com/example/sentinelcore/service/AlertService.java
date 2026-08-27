package com.example.sentinelcore.service;

import com.example.sentinelcore.dto.AlertDTO;
import com.example.sentinelcore.entity.Alert;
import com.example.sentinelcore.entity.Asset;
import com.example.sentinelcore.repository.AlertRepository;
import com.example.sentinelcore.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final AssetRepository assetRepository;

    private final NotificationService notificationService;
    private final SmsNotificationService smsNotificationService;

    @Value("${sentinelcore.alert.email}")
    private String alertReceiverEmail;

    @Value("${sentinelcore.alert.phone}")
    private String alertReceiverPhone;


    // ------------------------------------------------
    // CREATE ALERT USING STRING SEVERITY
    // ------------------------------------------------

    public AlertDTO createAlert(
            Long assetId,
            String severity,
            String message) {

        Alert.AlertSeverity alertSeverity =
                Alert.AlertSeverity.valueOf(
                        severity.trim().toUpperCase()
                );

        return createAlert(
                assetId,
                alertSeverity,
                message
        );
    }


    // ------------------------------------------------
    // CREATE ALERT
    // ------------------------------------------------

    public AlertDTO createAlert(
            Long assetId,
            Alert.AlertSeverity severity,
            String message) {

        Asset asset = assetRepository
                .findById(assetId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Asset not found: " + assetId
                        )
                );

        Alert alert = new Alert();

        alert.setAsset(asset);
        alert.setSeverity(severity);
        alert.setMessage(message);
        alert.setStatus(Alert.AlertStatus.OPEN);
        alert.setCreatedAt(LocalDateTime.now());

        Alert savedAlert =
                alertRepository.save(alert);


        // ------------------------------------------------
        // HIGH / CRITICAL NOTIFICATIONS
        // ------------------------------------------------

        if (savedAlert.getSeverity()
                == Alert.AlertSeverity.HIGH ||

                savedAlert.getSeverity()
                        == Alert.AlertSeverity.CRITICAL) {


            // ================================================
            // EMAIL NOTIFICATION
            // ================================================

            try {

                System.out.println(
                        "=== EMAIL NOTIFICATION TRIGGERED ==="
                );

                System.out.println(
                        "Severity: "
                                + savedAlert.getSeverity()
                );

                System.out.println(
                        "Email Receiver: "
                                + alertReceiverEmail
                );

                notificationService.sendAlertEmail(
                        alertReceiverEmail,
                        asset.getAssetName(),
                        savedAlert.getSeverity().name(),
                        savedAlert.getMessage()
                );

                System.out.println(
                        "=== EMAIL NOTIFICATION SENT SUCCESSFULLY ==="
                );

            } catch (Exception e) {

                System.err.println(
                        "Email notification failed: "
                                + e.getMessage()
                );
            }


            // ================================================
            // SMS NOTIFICATION
            // ================================================

            try {

                System.out.println(
                        "=== SMS NOTIFICATION TRIGGERED ==="
                );

                smsNotificationService.sendAlertSms(
                        alertReceiverPhone,
                        asset.getAssetName(),
                        savedAlert.getSeverity().name(),
                        savedAlert.getMessage()
                );

                System.out.println(
                        "=== SMS NOTIFICATION SENT SUCCESSFULLY ==="
                );

            } catch (Exception e) {

                System.err.println(
                        "SMS notification failed: "
                                + e.getMessage()
                );
            }
        }


        return toDTO(savedAlert);
    }


    // ------------------------------------------------
    // GET ALL ALERTS
    // ------------------------------------------------

    public List<AlertDTO> getAllAlerts() {

        return alertRepository
                .findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }


    // ------------------------------------------------
    // GET ALERT BY ID
    // ------------------------------------------------

    public AlertDTO getAlertById(Long id) {

        Alert alert = alertRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Alert not found with id: "
                                        + id
                        )
                );

        return toDTO(alert);
    }


    // ------------------------------------------------
    // GET ALERTS BY ASSET
    // ------------------------------------------------

    public List<AlertDTO> getAlertsByAsset(
            Long assetId) {

        return alertRepository
                .findByAssetId(assetId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }


    // ------------------------------------------------
    // ACKNOWLEDGE ALERT
    // ------------------------------------------------

    public AlertDTO acknowledgeAlert(Long id) {

        Alert alert =
                getAlertEntity(id);

        if (alert.getStatus()
                == Alert.AlertStatus.RESOLVED) {

            throw new RuntimeException(
                    "Resolved alert cannot be acknowledged"
            );
        }

        alert.setStatus(
                Alert.AlertStatus.ACKNOWLEDGED
        );

        return toDTO(
                alertRepository.save(alert)
        );
    }


    // ------------------------------------------------
    // RESOLVE ALERT
    // ------------------------------------------------

    public AlertDTO resolveAlert(Long id) {

        Alert alert =
                getAlertEntity(id);

        alert.setStatus(
                Alert.AlertStatus.RESOLVED
        );

        alert.setResolvedAt(
                LocalDateTime.now()
        );

        return toDTO(
                alertRepository.save(alert)
        );
    }


    // ------------------------------------------------
    // GET ALERT ENTITY
    // ------------------------------------------------

    private Alert getAlertEntity(Long id) {

        return alertRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Alert not found with id: "
                                        + id
                        )
                );
    }


    // ------------------------------------------------
    // GET OPEN ALERTS
    // ------------------------------------------------

    public List<AlertDTO> getOpenAlerts() {

        return alertRepository
                .findByStatus(
                        Alert.AlertStatus.OPEN
                )
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }


    // ------------------------------------------------
    // CHECK WHETHER ASSET HAS OPEN ALERT
    // ------------------------------------------------

    public boolean hasOpenAlert(Long assetId) {

        return !alertRepository
                .findByAssetIdAndStatus(
                        assetId,
                        Alert.AlertStatus.OPEN
                )
                .isEmpty();
    }


    // ------------------------------------------------
    // ENTITY -> DTO
    // ------------------------------------------------

    private AlertDTO toDTO(Alert alert) {

        return AlertDTO.builder()

                .id(
                        alert.getId()
                )

                .assetId(
                        alert.getAsset().getId()
                )

                .assetName(
                        alert.getAsset()
                                .getAssetName()
                )

                .severity(
                        alert.getSeverity().name()
                )

                .message(
                        alert.getMessage()
                )

                .status(
                        alert.getStatus().name()
                )

                .createdAt(
                        alert.getCreatedAt() != null
                                ? alert.getCreatedAt()
                                .toString()
                                : null
                )

                .resolvedAt(
                        alert.getResolvedAt() != null
                                ? alert.getResolvedAt()
                                .toString()
                                : null
                )

                .build();
    }
}