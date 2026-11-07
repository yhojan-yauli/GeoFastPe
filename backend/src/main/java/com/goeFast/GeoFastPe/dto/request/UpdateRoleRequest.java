package com.goeFast.GeoFastPe.dto.request;

import com.goeFast.GeoFastPe.entity.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateRoleRequest(
        @NotNull(message = "El rol es obligatorio")
        Role role
) {
}
