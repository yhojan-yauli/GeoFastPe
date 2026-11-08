package com.goeFast.GeoFastPe.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Nueva conversacion. El usuario autenticado queda como miembro.")
public record ConversationRequest(
        @NotBlank(message = "El nombre de la conversacion es obligatorio")
        @Size(max = 80, message = "El nombre no debe superar 80 caracteres")
        @Schema(example = "Vecinos del barrio")
        String title,

        @Size(max = 120, message = "El subtitulo no debe superar 120 caracteres")
        @Schema(nullable = true, example = "Conversacion creada por la comunidad")
        String subtitle,

        @NotBlank(message = "La categoria es obligatoria")
        @Schema(description = "Vecinos, Servicios, Eventos, Grupos o Ventas", example = "Vecinos")
        String category
) {
}
