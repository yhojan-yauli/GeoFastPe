package com.goeFast.GeoFastPe.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Servicio local que publica el usuario. Si locationType es gps envia latitude y longitude; si es address envia address.")
public record ServiceRequest(
        @NotBlank(message = "El titulo es obligatorio")
        @Size(max = 100, message = "El titulo no debe superar 100 caracteres")
        @Schema(example = "Electricista a domicilio")
        String title,

        @NotBlank(message = "La categoria es obligatoria")
        @Schema(description = "Hogar, Transporte, Salud, Educación u Otros", example = "Hogar")
        String category,

        @NotBlank(message = "El tipo de servicio es obligatorio")
        @Schema(description = "Servicio a domicilio, Servicio en local, Servicio virtual o Servicio mixto",
                example = "Servicio a domicilio")
        String type,

        @NotBlank(message = "La descripcion es obligatoria")
        @Size(max = 500, message = "La descripcion no debe superar 500 caracteres")
        @Schema(example = "Instalaciones electricas y reparaciones, con 10 anos de experiencia.")
        String description,

        @NotBlank(message = "El numero de contacto es obligatorio")
        @Pattern(regexp = "^\\d{9}$", message = "El numero de contacto debe tener 9 digitos")
        @Schema(example = "987654321")
        String phone,

        @NotBlank(message = "El tipo de ubicacion es obligatorio")
        @Schema(description = "gps o address", example = "address")
        String locationType,

        @Size(max = 200, message = "La direccion no debe superar 200 caracteres")
        @Schema(description = "Obligatoria si locationType = address", example = "Av. Ejercito 123, Cayma", nullable = true)
        String address,

        @Schema(description = "Obligatoria si locationType = gps", example = "-16.3989", nullable = true)
        Double latitude,

        @Schema(description = "Obligatoria si locationType = gps", example = "-71.5350", nullable = true)
        Double longitude,

        @NotBlank(message = "La disponibilidad es obligatoria")
        @Schema(description = "weekdays, weekends, everyday o appointment", example = "weekdays")
        String availability,

        @Schema(description = "URL de la imagen devuelta por POST /api/v1/archivos", nullable = true)
        String image
) {
}
