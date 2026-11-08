package com.goeFast.GeoFastPe.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Datos para crear una cuenta. Debes enviar al menos correo o telefono.")
public record RegisterRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 120, message = "El nombre no debe superar 120 caracteres")
        @Schema(description = "Nombre completo del usuario", example = "Juan Perez")
        String name,

        @Email(message = "El correo no tiene un formato valido")
        @Size(max = 150, message = "El correo no debe superar 150 caracteres")
        @Schema(description = "Correo electronico (opcional si envias telefono)",
                example = "juan@correo.com", nullable = true)
        String email,

        @Pattern(regexp = "^$|^[+0-9\\s\\-().]{6,20}$", message = "Formato de telefono invalido")
        @Schema(description = "Telefono (opcional si envias correo). Se normaliza a +51...",
                example = "987654321", nullable = true)
        String phone,

        @NotBlank(message = "La contrasena es obligatoria")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,64}$",
                message = "La contrasena debe tener entre 8 y 64 caracteres, al menos una letra, un numero y un caracter especial")
        @Schema(description = "Minimo 8 caracteres, con al menos una letra, un numero y un caracter especial",
                example = "miClave123!")
        String password
) {
}
