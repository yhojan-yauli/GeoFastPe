package com.goeFast.GeoFastPe.dto.response;

import com.goeFast.GeoFastPe.entity.EmergencyReport;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;

@Schema(description = "Reporte de emergencia (SOS). No se notifica automaticamente a autoridades.")
public record EmergencyResponse(
        Long id,
        Long reporterId,
        String reporterName,
        String title,
        String type,
        String urgency,
        String description,
        String locationText,
        Double lat,
        Double lng,
        List<String> images,
        String status,
        Instant createdAt,
        Instant updatedAt
) {

    public static EmergencyResponse from(EmergencyReport e) {
        return new EmergencyResponse(
                e.getId(), e.getReporter().getId(), e.getReporter().getName(),
                e.getTitle(), e.getType(), e.getUrgency(), e.getDescription(), e.getLocationText(),
                e.getLat(), e.getLng(), List.copyOf(e.getImages()), e.getStatus(),
                e.getCreatedAt(), e.getUpdatedAt()
        );
    }
}
