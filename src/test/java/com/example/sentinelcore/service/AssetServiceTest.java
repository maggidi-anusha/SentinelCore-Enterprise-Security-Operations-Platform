package com.example.sentinelcore.service;

import com.example.sentinelcore.dto.AssetDTO;
import com.example.sentinelcore.dto.DashboardSummaryDTO;
import com.example.sentinelcore.entity.Asset;
import com.example.sentinelcore.repository.AssetRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssetServiceTest {

    @Mock
    private AssetRepository assetRepository;

    @InjectMocks
    private AssetService assetService;

    private Asset testAsset;

    @BeforeEach
    void setUp() {

        testAsset = Asset.builder()
                .id(4L)
                .assetName("Network Device1")
                .assetType("Network Device")
                .ipAddress("192.168.2.21")
                .location("Hyderabad")
                .address("Data Center B")
                .memoryUsage(55.5)
                .cpuUsage(96.0)
                .diskUsage(61.2)
                .networkUsage(31.4)
                .status(Asset.AssetStatus.CRITICAL)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // TEST 1
    @Test
    void testGetAllAssets() {

        // Arrange
        when(assetRepository.findAll())
                .thenReturn(List.of(testAsset));

        // Act
        List<AssetDTO> result =
                assetService.getAllAssets();

        // Assert
        assertEquals(1, result.size());
        assertEquals(
                "Network Device1",
                result.get(0).getAssetName()
        );

        verify(assetRepository).findAll();
    }

    // TEST 2
    @Test
    void testGetAssetById() {

        // Arrange
        when(assetRepository.findById(4L))
                .thenReturn(Optional.of(testAsset));

        // Act
        AssetDTO result =
                assetService.getAssetById(4L);

        // Assert
        assertNotNull(result);
        assertEquals(4L, result.getId());
        assertEquals(
                "Network Device1",
                result.getAssetName()
        );
        assertEquals(
                "CRITICAL",
                result.getStatus()
        );
    }

    // TEST 3
    @Test
    void testGetAssetByIdWhenAssetDoesNotExist() {

        // Arrange
        when(assetRepository.findById(100L))
                .thenReturn(Optional.empty());

        // Act + Assert
        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> assetService.getAssetById(100L)
                );

        assertEquals(
                "Asset not found with id: 100",
                exception.getMessage()
        );
    }

    // TEST 4
    @Test
    void testCreateAsset() {

        // Arrange
        AssetDTO input = AssetDTO.builder()
                .assetName("Application Server")
                .assetType("SERVER")
                .ipAddress("192.168.1.100")
                .location("Hyderabad")
                .address("Data Center A")
                .memoryUsage(40.0)
                .cpuUsage(50.0)
                .diskUsage(60.0)
                .networkUsage(30.0)
                .status("ONLINE")
                .build();

        when(assetRepository.save(any(Asset.class)))
                .thenAnswer(invocation -> {

                    Asset asset =
                            invocation.getArgument(0);

                    asset.setId(10L);

                    return asset;
                });

        // Act
        AssetDTO result =
                assetService.createAsset(input);

        // Assert
        assertNotNull(result);
        assertEquals(10L, result.getId());

        assertEquals(
                "Application Server",
                result.getAssetName()
        );

        assertEquals(
                "ONLINE",
                result.getStatus()
        );

        verify(assetRepository)
                .save(any(Asset.class));
    }

    // TEST 5
    @Test
    void testDeleteAsset() {

        // Arrange
        when(assetRepository.existsById(4L))
                .thenReturn(true);

        // Act
        assetService.deleteAsset(4L);

        // Assert
        verify(assetRepository)
                .deleteById(4L);
    }

    // TEST 6
    @Test
    void testDashboardSummary() {

        // Arrange
        Asset onlineAsset = Asset.builder()
                .id(1L)
                .assetName("Server 1")
                .status(Asset.AssetStatus.ONLINE)
                .cpuUsage(40.0)
                .memoryUsage(50.0)
                .build();

        Asset criticalAsset = Asset.builder()
                .id(2L)
                .assetName("Server 2")
                .status(Asset.AssetStatus.CRITICAL)
                .cpuUsage(80.0)
                .memoryUsage(70.0)
                .build();

        when(assetRepository.findAll())
                .thenReturn(
                        List.of(
                                onlineAsset,
                                criticalAsset
                        )
                );

        // Act
        DashboardSummaryDTO result =
                assetService.getDashboardSummary();

        // Assert
        assertEquals(
                2L,
                result.getTotalAssets()
        );

        assertEquals(
                1L,
                result.getOnlineAssets()
        );

        assertEquals(
                1L,
                result.getOfflineAssets()
        );

        assertEquals(
                50.0,
                result.getUptimePercentage()
        );

        assertEquals(
                60.0,
                result.getAvgCpuUsage()
        );

        assertEquals(
                60.0,
                result.getAvgMemoryUsage()
        );
    }

    @Test
    void testSearchAssets() {

        // Arrange
        when(assetRepository.findAll(
                any(Specification.class)
        )).thenReturn(List.of(testAsset));

        // Act
        List<AssetDTO> result =
                assetService.searchAssets("Network");

        // Assert
        assertEquals(1, result.size());

        assertEquals(
                "Network Device1",
                result.get(0).getAssetName()
        );

        assertEquals(
                4L,
                result.get(0).getId()
        );

        verify(assetRepository)
                .findAll(any(Specification.class));
    }

    @Test
    void testSearchAssetsCaseInsensitive() {

        // Arrange
        when(assetRepository.findAll(
                any(Specification.class)
        )).thenReturn(List.of(testAsset));

        // Act
        List<AssetDTO> result =
                assetService.searchAssets("NETWORK");

        // Assert
        assertEquals(1, result.size());

        assertEquals(
                "Network Device1",
                result.get(0).getAssetName()
        );

        verify(assetRepository)
                .findAll(any(Specification.class));
    }

    @Test
    void testSearchAssetsById() {

        // Arrange
        when(assetRepository.findAll(
                any(Specification.class)
        )).thenReturn(List.of(testAsset));

        // Act
        List<AssetDTO> result =
                assetService.searchAssets("4");

        // Assert
        assertEquals(1, result.size());

        assertEquals(
                4L,
                result.get(0).getId()
        );

        assertEquals(
                "Network Device1",
                result.get(0).getAssetName()
        );
    }

    @Test
    void testSearchAssetsWithEmptySearchReturnsAllAssets() {

        // Arrange
        when(assetRepository.findAll())
                .thenReturn(List.of(testAsset));

        // Act
        List<AssetDTO> result =
                assetService.searchAssets("");

        // Assert
        assertEquals(1, result.size());

        assertEquals(
                "Network Device1",
                result.get(0).getAssetName()
        );

        verify(assetRepository).findAll();
    }
}