package com.goeFast.GeoFastPe.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record VerifyRegisterRequest(
        @NotBlank(message = "El telefono es obligatorio")
        @Pattern(regexp = "^[+0-9\\s\\-().]{6,20}$", message = "Formato de telefono invalido")
        String phone,

        @NotBlank(message = "El codigo es obligatorio")
        @Pattern(regexp = "^\\d{6}$", message = "El codigo debe tener 6 digitos")
        String code,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 120, message = "El nombre no debe superar 120 caracteres")
        String fullName
) {
}
