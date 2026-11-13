package com.goeFast.GeoFastPe.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Cambio de contrasena del usuario autenticado.")
public record ChangePasswordRequest(

        @NotBlank(message = "La contrasena actual es obligatoria")
        @Schema(description = "Contrasena actual", example = "miClave123!")
        String currentPassword,

        @NotBlank(message = "La nueva contrasena es obligatoria")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,64}$",
                message = "La nueva contrasena debe tener entre 8 y 64 caracteres, al menos una letra, un numero y un caracter especial")
        @Schema(description = "Nueva contrasena", example = "otraClave456#")
        String newPassword
) {
}
