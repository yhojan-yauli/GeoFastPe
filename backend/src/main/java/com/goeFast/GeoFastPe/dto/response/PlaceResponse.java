package com.goeFast.GeoFastPe.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Lugar encontrado por busqueda de direcciones.")
public record PlaceResponse(
        String name,
        String displayName,
        double lat,
        double lng,
        Double distance
) {
}
