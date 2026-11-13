package com.goeFast.GeoFastPe.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Punto comunitario para el mapa con información suficiente para mostrar el detalle sin otra petición.")
public record MapPointResponse(
        String kind,
        Long id,
        String title,
        String category,
        String type,
        String description,
        Double lat,
        Double lng,
        double distance,
        String location,
        String status,
        String priority,
        String ownerName,
        String image,
        String date,
        String time
) {}
