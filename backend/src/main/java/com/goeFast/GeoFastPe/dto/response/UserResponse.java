package com.goeFast.GeoFastPe.dto.response;

import com.goeFast.GeoFastPe.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Datos publicos del usuario (nunca incluye la contrasena).")
public record UserResponse(
        @Schema(description = "Identificador del usuario", example = "1")
        Long id,
        @Schema(description = "Nombre completo", example = "Juan Perez")
        String name,
        @Schema(description = "Correo electronico", example = "juan@correo.com", nullable = true)
        String email,
        @Schema(description = "Telefono en formato E.164", example = "+51987654321", nullable = true)
        String phone,
        @Schema(description = "Ciudad", example = "Arequipa", nullable = true)
        String city,
        @Schema(description = "Descripcion personal", nullable = true)
        String bio,
        @Schema(description = "URL de la foto de perfil (obtenida con POST /api/v1/archivos)", nullable = true)
        String avatar,
        @Schema(description = "Rol del usuario", example = "USER")
        String role,
        @Schema(description = "Indica si la cuenta esta activa", example = "true")
        boolean active,
        @Schema(description = "Fecha de creacion")
        Instant createdAt,
        @Schema(description = "Ultimo inicio de sesion")
        Instant lastLoginAt
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getCity(),
                user.getBio(),
                user.getAvatar(),
                user.getRole().name(),
                user.isActive(),
                user.getCreatedAt(),
                user.getLastLoginAt()
        );
    }
}
