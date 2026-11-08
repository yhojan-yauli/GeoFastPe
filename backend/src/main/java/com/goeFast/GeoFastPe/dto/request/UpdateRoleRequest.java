package com.goeFast.GeoFastPe.dto.request;

import com.goeFast.GeoFastPe.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Nuevo rol que se asignara al usuario.")
public record UpdateRoleRequest(
        @NotNull(message = "El rol es obligatorio")
        @Schema(description = "Rol a asignar", example = "ADMIN")
        Role role
) {
}
