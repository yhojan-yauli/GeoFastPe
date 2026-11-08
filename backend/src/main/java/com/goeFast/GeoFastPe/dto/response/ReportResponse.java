package com.goeFast.GeoFastPe.dto.response;

import com.goeFast.GeoFastPe.entity.CitizenReport;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;

@Schema(description = "Reporte ciudadano de una incidencia comunitaria.")
public record ReportResponse(
        Long id,
        Long ownerId,
        String ownerName,
        String title,
        String category,
        String priority,
        String description,
        String location,
        Double lat,
        Double lng,
        List<String> images,
        String status,
        Instant createdAt,
        Instant updatedAt
) {

    public static ReportResponse from(CitizenReport r) {
        return new ReportResponse(
                r.getId(), r.getOwner().getId(), r.getOwner().getName(),
                r.getTitle(), r.getCategory(), r.getPriority(), r.getDescription(), r.getLocation(),
                r.getLat(), r.getLng(), List.copyOf(r.getImages()), r.getStatus(),
                r.getCreatedAt(), r.getUpdatedAt()
        );
    }
}
