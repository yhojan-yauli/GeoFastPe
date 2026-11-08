package com.goeFast.GeoFastPe.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Datos del perfil a actualizar. Los campos omitidos no cambian; un telefono vacio lo elimina.")
public record UpdateProfileRequest(
        @Size(min = 2, max = 120, message = "El nombre debe tener entre 2 y 120 caracteres")
        @Schema(description = "Nombre completo", example = "Juan Perez", nullable = true)
        String name,

        @Pattern(regexp = "^$|^[+0-9\\s\\-().]{6,20}$", message = "Formato de telefono invalido")
        @Schema(description = "Telefono (se normaliza a E.164)", example = "987654321", nullable = true)
        String phone,

        @Size(max = 80, message = "La ciudad no debe superar 80 caracteres")
        @Schema(description = "Ciudad", example = "Arequipa", nullable = true)
        String city,

        @Size(max = 240, message = "La descripcion no debe superar 240 caracteres")
        @Schema(description = "Sobre mi", nullable = true)
        String bio,

        @Size(max = 500, message = "La URL de la foto es demasiado larga")
        @Schema(description = "URL de la foto de perfil devuelta por POST /api/v1/archivos", nullable = true)
        String avatar
) {
}
