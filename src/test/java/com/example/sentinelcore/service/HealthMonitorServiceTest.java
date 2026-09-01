package com.example.sentinelcore.service;

import com.example.sentinelcore.entity.Alert;
import com.example.sentinelcore.entity.Asset;
import com.example.sentinelcore.repository.AssetRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HealthMonitorServiceTest {

    @Mock
    private AssetRepository assetRepository;

    @Mock
    private AlertService alertService;

    @InjectMocks
    private HealthMonitorService healthMonitorService;


    // ------------------------------------------------
    // TEST 3 - CRITICAL CPU ALERT
    // ------------------------------------------------

    @Test
    void testCriticalCpuCreatesAlert() {

        // Arrange

        Asset asset = Asset.builder()
                .id(4L)
                .assetName("Network device1")
                .assetType("Network device")
                .cpuUsage(96.0)
                .memoryUsage(55.5)
                .status(Asset.AssetStatus.ONLINE)
                .build();


        when(assetRepository.findAll())
                .thenReturn(
                        List.of(asset)
                );


        when(alertService.hasOpenAlert(4L))
                .thenReturn(false);


        // Act

        healthMonitorService.checkAssetHealth();


        // Assert

        assertEquals(
                Asset.AssetStatus.CRITICAL,
                asset.getStatus()
        );


        verify(alertService)
                .hasOpenAlert(4L);


        verify(alertService)
                .createAlert(
                        4L,
                        Alert.AlertSeverity.CRITICAL,
                        "CPU usage critical: 96.0%"
                );


        verify(assetRepository)
                .save(asset);
    }
}