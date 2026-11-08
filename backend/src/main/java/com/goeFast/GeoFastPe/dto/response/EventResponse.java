package com.goeFast.GeoFastPe.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.goeFast.GeoFastPe.entity.CommunityEvent;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Schema(description = "Evento comunitario. status se calcula segun la fecha (Próximo o Finalizado).")
public record EventResponse(
        Long id,
        Long ownerId,
        String ownerName,
        String title,
        String category,
        String type,
        String description,
        LocalDate date,
        @JsonFormat(pattern = "HH:mm") LocalTime time,
        String location,
        Double lat,
        Double lng,
        String image,
        String status,
        long participants,
        boolean joined,
        Instant createdAt
) {

    public static EventResponse from(CommunityEvent e, String status, long participants, boolean joined) {
        return new EventResponse(
                e.getId(), e.getOwner().getId(), e.getOwner().getName(),
                e.getTitle(), e.getCategory(), e.getType(), e.getDescription(), e.getDate(), e.getTime(),
                e.getLocation(), e.getLat(), e.getLng(), e.getImage(), status, participants, joined,
                e.getCreatedAt()
        );
    }
}
