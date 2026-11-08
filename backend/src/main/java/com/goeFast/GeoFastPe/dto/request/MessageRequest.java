package com.goeFast.GeoFastPe.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Mensaje a enviar en una conversacion.")
public record MessageRequest(
        @NotBlank(message = "El mensaje no puede estar vacio")
        @Size(max = 2000, message = "El mensaje no debe superar 2000 caracteres")
        @Schema(example = "Hola, sigue disponible?")
        String text
) {
}
