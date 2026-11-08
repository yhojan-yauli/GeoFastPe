package com.goeFast.GeoFastPe.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

@Schema(description = "Evento comunitario. La fecha y hora deben ser futuras (zona horaria America/Lima).")
public record EventRequest(
        @NotBlank(message = "El nombre del evento es obligatorio")
        @Size(max = 120, message = "El nombre no debe superar 120 caracteres")
        @Schema(example = "Feria de reciclaje")
        String title,

        @NotBlank(message = "La categoria es obligatoria")
        @Schema(description = "Cultura, Deporte, Educación, Salud, Ambiente u Otros", example = "Ambiente")
        String category,

        @NotBlank(message = "El tipo de evento es obligatorio")
        @Schema(description = "Presencial, Virtual o Híbrido", example = "Presencial")
        String type,

        @NotBlank(message = "La descripcion es obligatoria")
        @Size(max = 500, message = "La descripcion no debe superar 500 caracteres")
        @Schema(example = "Jornada para reciclar residuos en el parque.")
        String description,

        @NotNull(message = "La fecha es obligatoria")
        @Schema(description = "Formato yyyy-MM-dd", example = "2026-12-05", type = "string", format = "date")
        LocalDate date,

        @NotNull(message = "La hora es obligatoria")
        @JsonFormat(pattern = "HH:mm")
        @Schema(description = "Formato HH:mm", example = "09:00", type = "string")
        LocalTime time,

        @NotBlank(message = "El lugar es obligatorio")
        @Size(max = 200, message = "El lugar no debe superar 200 caracteres")
        @Schema(example = "Parque Selva Alegre, Arequipa")
        String location,

        @Schema(nullable = true, example = "-16.4000")
        Double lat,

        @Schema(nullable = true, example = "-71.5300")
        Double lng,

        @Schema(description = "URL de la imagen devuelta por POST /api/v1/archivos", nullable = true)
        String image
) {
}
