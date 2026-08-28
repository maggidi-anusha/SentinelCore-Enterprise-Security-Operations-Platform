package com.example.sentinelcore.repository;

import com.example.sentinelcore.entity.Asset;
import org.springframework.data.jpa.domain.Specification;

public class AssetSpecification {

    public static Specification<Asset> searchAssets(
            String search) {

        // Empty search = no filtering
        if (search == null || search.isBlank()) {
            return null;
        }

        String searchValue = search.trim();

        return (root, query, criteriaBuilder) -> {

            // If input is a number, search by exact asset ID
            try {

                Long assetId =
                        Long.parseLong(searchValue);

                return criteriaBuilder.equal(
                        root.get("id"),
                        assetId
                );

            } catch (NumberFormatException e) {

                // Otherwise search by asset name
                // Case-insensitive search
                return criteriaBuilder.like(
                        criteriaBuilder.lower(
                                root.get("assetName")
                        ),
                        "%" +
                                searchValue.toLowerCase() +
                                "%"
                );
            }
        };
    }
}