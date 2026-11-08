package com.goeFast.GeoFastPe.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Estadisticas del usuario autenticado.")
public record ProfileStatsResponse(
        @Schema(description = "Servicios, ventas, solidaridad, reportes y eventos creados por el usuario")
        long publications,
        @Schema(description = "Donaciones de solidaridad publicadas por el usuario")
        long helps,
        @Schema(description = "Eventos creados por el usuario y eventos a los que asiste")
        long events
) {
}
