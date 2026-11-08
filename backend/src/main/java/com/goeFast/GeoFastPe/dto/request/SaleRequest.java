package com.goeFast.GeoFastPe.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

@Schema(description = "Producto de Ventas Locales.")
public record SaleRequest(
        @NotBlank(message = "El nombre del producto es obligatorio")
        @Size(max = 120, message = "El nombre no debe superar 120 caracteres")
        @Schema(example = "Laptop Lenovo ThinkPad")
        String name,

        @NotBlank(message = "La categoria es obligatoria")
        @Schema(description = "Tecnología, Hogar, Moda, Deportes, Vehículos, Libros u Otros", example = "Tecnología")
        String category,

        @NotBlank(message = "El estado del producto es obligatorio")
        @Schema(description = "Nuevo o Usado", example = "Usado")
        String condition,

        @NotNull(message = "El precio es obligatorio")
        @DecimalMin(value = "0.01", message = "El precio debe ser mayor que 0")
        @Schema(example = "1800.00")
        BigDecimal price,

        @NotBlank(message = "La descripcion es obligatoria")
        @Size(max = 1000, message = "La descripcion no debe superar 1000 caracteres")
        @Schema(example = "Equipo en buen estado, incluye cargador.")
        String description,

        @NotBlank(message = "El distrito es obligatorio")
        @Schema(description = "Distrito donde se encuentra el producto", example = "Cayma")
        String location,

        @Schema(description = "Disponible o Vendido. Si se omite se mantiene Disponible.", nullable = true)
        String status,

        @Schema(description = "URL de la imagen devuelta por POST /api/v1/archivos", nullable = true)
        String image
) {
}
