package com.goeFast.GeoFastPe.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

@Schema(description = "Reporte SOS. Envia locationText, o lat y lng, o ambos. Las imagenes son URLs de POST /api/v1/archivos (maximo 5).")
public record EmergencyRequest(
        @NotBlank(message = "El titulo es obligatorio")
        @Size(max = 120, message = "El titulo no debe superar 120 caracteres")
        @Schema(example = "Incendio en vivienda")
        String title,

        @NotBlank(message = "El tipo de emergencia es obligatorio")
        @Schema(description = "Salud, Incendio, Riesgo en la vía, Seguridad, Desastre natural u Otra", example = "Incendio")
        String type,

        @NotBlank(message = "La urgencia es obligatoria")
        @Schema(description = "Alta, Media o Baja", example = "Alta")
        String urgency,

        @NotBlank(message = "La descripcion es obligatoria")
        @Size(max = 500, message = "La descripcion no debe superar 500 caracteres")
        @Schema(example = "Humo saliendo de la cocina, hay personas dentro.")
        String description,

        @Size(max = 200, message = "La referencia no debe superar 200 caracteres")
        @Schema(description = "Direccion o referencia", example = "Av. Dolores, cerca del parque", nullable = true)
        String locationText,

        @Schema(example = "-16.3989", nullable = true)
        Double lat,

        @Schema(example = "-71.5350", nullable = true)
        Double lng,

        @Schema(description = "URLs de imagenes (maximo 5)", nullable = true)
        List<String> images
) {
}
