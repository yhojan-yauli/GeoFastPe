package com.goeFast.GeoFastPe.dto.response;

import com.goeFast.GeoFastPe.entity.ServiceListing;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Servicio local publicado.")
public record ServiceResponse(
        Long id,
        Long ownerId,
        String ownerName,
        String ownerUsername,
        String title,
        String category,
        String type,
        String description,
        String phone,
        String locationType,
        String address,
        Double latitude,
        Double longitude,
        String availability,
        String image,
        Instant createdAt,
        Instant updatedAt
) {

    public static ServiceResponse from(ServiceListing s) {
        return new ServiceResponse(
                s.getId(), s.getOwner().getId(), s.getOwner().getName(), s.getOwner().getUsername(),
                s.getTitle(), s.getCategory(), s.getType(), s.getDescription(), s.getPhone(),
                s.getLocationType(), s.getAddress(), s.getLatitude(), s.getLongitude(),
                s.getAvailability(), s.getImage(), s.getCreatedAt(), s.getUpdatedAt()
        );
    }
}
