package com.goeFast.GeoFastPe.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Punto para el mapa. kind: SERVICIO o EMERGENCIA. type es el tipo de servicio o de emergencia.")
public record MapPointResponse(
        String kind,
        Long id,
        String title,
        String category,
        String type,
        String description,
        Double lat,
        Double lng,
        double distance
) {
}
