package com.goeFast.GeoFastPe.dto.response;

import com.goeFast.GeoFastPe.entity.SolidarityPost;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Donacion o solicitud de ayuda. favorito indica si el usuario autenticado la marco.")
public record SolidarityResponse(
        Long id,
        Long ownerId,
        String ownerName,
        String tipo,
        String title,
        String category,
        String description,
        String condition,
        String urgency,
        String location,
        Double lat,
        Double lng,
        String image,
        String status,
        boolean favorito,
        Instant createdAt,
        Instant updatedAt
) {

    public static SolidarityResponse from(SolidarityPost p, boolean favorito) {
        return new SolidarityResponse(
                p.getId(), p.getOwner().getId(), p.getOwner().getName(),
                p.getTipo(), p.getTitle(), p.getCategory(), p.getDescription(), p.getCondition(),
                p.getUrgency(), p.getLocation(), p.getLat(), p.getLng(), p.getImage(), p.getStatus(),
                favorito, p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
