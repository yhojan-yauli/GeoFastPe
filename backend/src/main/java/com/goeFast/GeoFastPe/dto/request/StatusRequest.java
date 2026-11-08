package com.goeFast.GeoFastPe.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Cambio de estado. Emergencias: Registrada, En atención, Atendida o Cerrada. Reportes: Pendiente, En proceso, En revisión o Resuelto.")
public record StatusRequest(
        @NotBlank(message = "El estado es obligatorio")
        @Schema(example = "En proceso")
        String estado
) {
}
