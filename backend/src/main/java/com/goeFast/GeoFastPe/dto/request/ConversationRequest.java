package com.goeFast.GeoFastPe.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Nueva conversacion. El usuario autenticado queda como miembro y opcionalmente se agrega un destinatario.")
public record ConversationRequest(
        @NotBlank(message = "El nombre de la conversacion es obligatorio")
        @Size(max = 80, message = "El nombre no debe superar 80 caracteres")
        String title,
        @Size(max = 120, message = "El subtitulo no debe superar 120 caracteres")
        String subtitle,
        @NotBlank(message = "La categoria es obligatoria")
        String category,
        Long recipientId,
        Boolean publicGroup
) {}
