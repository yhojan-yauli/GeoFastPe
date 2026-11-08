package com.goeFast.GeoFastPe.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Respuesta de registro o login. Incluye el token JWT.")
public record AuthResponse(
        @Schema(description = "Token JWT para enviar en Authorization: Bearer <token>")
        String token,
        @Schema(description = "Tipo de token", example = "Bearer")
        String tokenType,
        @Schema(description = "Duracion del token en segundos", example = "86400")
        long expiresInSeconds,
        @Schema(description = "Datos del usuario autenticado")
        UserResponse user
) {
}
