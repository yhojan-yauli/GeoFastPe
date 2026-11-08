package com.goeFast.GeoFastPe.controller;

import com.goeFast.GeoFastPe.dto.request.UpdateRoleRequest;
import com.goeFast.GeoFastPe.dto.response.UserResponse;
import com.goeFast.GeoFastPe.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/users")
@Tag(name = "Administracion", description = "Gestion de usuarios. Solo accesible con rol ADMIN.")
@SecurityRequirement(name = "bearerAuth")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(
            summary = "Listar usuarios",
            description = "Devuelve todos los usuarios registrados. Requiere rol ADMIN."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de usuarios."),
            @ApiResponse(responseCode = "401", description = "Falta el token o es invalido/expirado."),
            @ApiResponse(responseCode = "403", description = "El usuario no tiene rol ADMIN.")
    })
    public List<UserResponse> findAll() {
        return userService.findAll();
    }

    @PatchMapping("/{id}/role")
    @Operation(
            summary = "Cambiar el rol de un usuario",
            description = "Actualiza el rol (USER o ADMIN) del usuario indicado. Requiere rol ADMIN."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rol actualizado."),
            @ApiResponse(responseCode = "400", description = "El rol es obligatorio o no es valido."),
            @ApiResponse(responseCode = "401", description = "Falta el token o es invalido/expirado."),
            @ApiResponse(responseCode = "403", description = "El usuario no tiene rol ADMIN."),
            @ApiResponse(responseCode = "404", description = "El usuario indicado no existe.")
    })
    public UserResponse updateRole(@PathVariable Long id, @Valid @RequestBody UpdateRoleRequest request) {
        return userService.updateRole(id, request.role());
    }
}
