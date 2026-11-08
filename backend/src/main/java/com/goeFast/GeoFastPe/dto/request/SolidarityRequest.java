package com.goeFast.GeoFastPe.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Donacion o solicitud de ayuda. Donacion usa condition; solicitud usa urgency.")
public record SolidarityRequest(
        @NotBlank(message = "El tipo es obligatorio")
        @Schema(description = "DONACION o SOLICITUD", example = "DONACION")
        String tipo,

        @NotBlank(message = "El titulo es obligatorio")
        @Size(max = 120, message = "El titulo no debe superar 120 caracteres")
        @Schema(example = "Ropa de invierno en buen estado")
        String title,

        @NotBlank(message = "La categoria es obligatoria")
        @Schema(description = "Alimentos, Ropa, Útiles, Salud u Otros", example = "Ropa")
        String category,

        @NotBlank(message = "La descripcion es obligatoria")
        @Size(max = 500, message = "La descripcion no debe superar 500 caracteres")
        @Schema(example = "Abrigos y chompas para adultos.")
        String description,

        @Schema(description = "Obligatorio en donaciones: Nuevo, Buen estado o Usado", nullable = true)
        String condition,

        @Schema(description = "Obligatorio en solicitudes: Alta, Media o Baja", nullable = true)
        String urgency,

        @NotBlank(message = "La ubicacion aproximada es obligatoria")
        @Size(max = 120, message = "La ubicacion no debe superar 120 caracteres")
        @Schema(description = "Zona aproximada, no la direccion exacta", example = "Distrito de Cayma, Arequipa")
        String location,

        @Schema(description = "Disponible o Cerrada. Si se omite se mantiene Disponible.", nullable = true)
        String status,

        @Schema(description = "URL de la imagen devuelta por POST /api/v1/archivos", nullable = true)
        String image
) {
}
