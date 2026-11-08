package com.goeFast.GeoFastPe.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

@Schema(description = "Reporte ciudadano. Envia location, o lat y lng, o ambos. Las imagenes son URLs de POST /api/v1/archivos (maximo 5).")
public record ReportRequest(
        @NotBlank(message = "El titulo es obligatorio")
        @Size(max = 120, message = "El titulo no debe superar 120 caracteres")
        @Schema(example = "Bache en la Av. Principal")
        String title,

        @NotBlank(message = "La categoria es obligatoria")
        @Schema(description = "Infraestructura, Seguridad, Servicios u Otro", example = "Infraestructura")
        String category,

        @NotBlank(message = "La prioridad es obligatoria")
        @Schema(description = "Alta, Media o Baja", example = "Alta")
        String priority,

        @NotBlank(message = "La descripcion es obligatoria")
        @Size(max = 500, message = "La descripcion no debe superar 500 caracteres")
        @Schema(example = "Bache grande que puede causar accidentes.")
        String description,

        @Size(max = 200, message = "La ubicacion no debe superar 200 caracteres")
        @Schema(description = "Direccion o referencia", example = "Cercado de Arequipa", nullable = true)
        String location,

        @NotNull(message = "La latitud es obligatoria: elige el punto en el mapa")
        @Schema(description = "Latitud del punto elegido en el mapa", example = "-16.4090")
        Double lat,

        @NotNull(message = "La longitud es obligatoria: elige el punto en el mapa")
        @Schema(description = "Longitud del punto elegido en el mapa", example = "-71.5374")
        Double lng,

        @Schema(description = "URLs de evidencias (maximo 5)", nullable = true)
        List<String> images
) {
}
