package com.goeFast.GeoFastPe.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Credenciales para iniciar sesion con correo o telefono.")
public record LoginRequest(

        @NotBlank(message = "El correo o telefono es obligatorio")
        @Schema(description = "Correo electronico o telefono registrado",
                example = "juan@correo.com")
        String identifier,

        @NotBlank(message = "La contrasena es obligatoria")
        @Schema(description = "Contrasena de la cuenta", example = "miClave123")
        String password
) {
}
