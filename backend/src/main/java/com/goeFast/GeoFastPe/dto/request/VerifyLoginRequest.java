package com.goeFast.GeoFastPe.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyLoginRequest(
        @NotBlank(message = "El telefono es obligatorio")
        @Pattern(regexp = "^[+0-9\\s\\-().]{6,20}$", message = "Formato de telefono invalido")
        String phone,

        @NotBlank(message = "El codigo es obligatorio")
        @Pattern(regexp = "^\\d{6}$", message = "El codigo debe tener 6 digitos")
        String code
) {
}
