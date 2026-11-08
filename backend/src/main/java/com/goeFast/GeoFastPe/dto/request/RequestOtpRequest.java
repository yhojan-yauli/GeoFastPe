package com.goeFast.GeoFastPe.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RequestOtpRequest(
        @NotBlank(message = "El telefono es obligatorio")
        @Pattern(regexp = "^[+0-9\\s\\-().]{6,20}$", message = "Formato de telefono invalido")
        String phone
) {
}
