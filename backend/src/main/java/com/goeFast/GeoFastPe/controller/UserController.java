package com.goeFast.GeoFastPe.controller;

import com.goeFast.GeoFastPe.dto.request.UpdateProfileRequest;
import com.goeFast.GeoFastPe.dto.response.ProfileStatsResponse;
import com.goeFast.GeoFastPe.dto.response.UserResponse;
import com.goeFast.GeoFastPe.security.UserPrincipal;
import com.goeFast.GeoFastPe.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Usuarios", description = "Perfil del usuario autenticado. Requiere token JWT.")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @Operation(
            summary = "Ver mi perfil",
            description = "Devuelve los datos del usuario autenticado."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Perfil del usuario autenticado."),
            @ApiResponse(responseCode = "401", description = "Falta el token o es invalido/expirado.")
    })
    public UserResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return userService.getById(principal.id());
    }

    @PatchMapping("/me")
    @Operation(
            summary = "Actualizar mi perfil",
            description = "Permite cambiar el nombre completo del usuario autenticado."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Perfil actualizado."),
            @ApiResponse(responseCode = "400", description = "El nombre es obligatorio o supera 120 caracteres."),
            @ApiResponse(responseCode = "401", description = "Falta el token o es invalido/expirado.")
    })
    public UserResponse updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                      @Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(principal.id(), request);
    }

    @GetMapping("/me/estadisticas")
    @Operation(
            summary = "Mis estadisticas",
            description = "Cuenta tus publicaciones, donaciones y eventos (creados y asistidos)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Estadisticas del usuario."),
            @ApiResponse(responseCode = "401", description = "Falta el token o es invalido/expirado.")
    })
    public ProfileStatsResponse estadisticas(@AuthenticationPrincipal UserPrincipal principal) {
        return userService.estadisticas(principal.id());
    }
}
