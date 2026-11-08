package com.goeFast.GeoFastPe.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Ruta calculada entre dos puntos. geometry es un LineString GeoJSON.")
public record RouteResponse(
        double distanceMeters,
        double durationSeconds,
        JsonNode geometry
) {
}
