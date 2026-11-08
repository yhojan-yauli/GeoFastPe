package com.goeFast.GeoFastPe.controller;

import com.goeFast.GeoFastPe.dto.request.ChangePasswordRequest;
import com.goeFast.GeoFastPe.dto.request.LoginRequest;
import com.goeFast.GeoFastPe.dto.request.RegisterRequest;
import com.goeFast.GeoFastPe.dto.response.AuthResponse;
import com.goeFast.GeoFastPe.dto.response.UserResponse;
import com.goeFast.GeoFastPe.security.UserPrincipal;
import com.goeFast.GeoFastPe.service.AuthService;
import com.goeFast.GeoFastPe.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticacion", description = "Registro y login con correo o telefono + contrasena.")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            summary = "Registrar una cuenta",
            description = "Crea una cuenta con nombre, contrasena y al menos un correo o telefono. "
                    + "Puedes enviar solo email, solo phone, o ambos. "
                    + "La respuesta incluye el token JWT listo para usar."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Cuenta creada. Devuelve el token JWT."),
            @ApiResponse(responseCode = "400", description = "Datos invalidos, falta correo/telefono o telefono invalido."),
            @ApiResponse(responseCode = "409", description = "El correo o el telefono ya estan registrados.")
    })
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    @Operation(
            summary = "Iniciar sesion",
            description = "Envia el correo o el telefono en 'identifier' junto con la contrasena. "
                    + "Devuelve un token JWT nuevo."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Credenciales correctas. Devuelve el token JWT."),
            @ApiResponse(responseCode = "400", description = "Falta identifier o password."),
            @ApiResponse(responseCode = "401", description = "Correo/telefono o contrasena incorrectos."),
            @ApiResponse(responseCode = "403", description = "La cuenta esta desactivada.")
    })
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
            summary = "Obtener mi perfil",
            description = "Devuelve los datos del usuario autenticado. "
                    + "Primero pulsa Authorize y pega el token JWT (sin la palabra Bearer)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Perfil del usuario autenticado."),
            @ApiResponse(responseCode = "401", description = "Falta el token o es invalido/expirado.")
    })
    public UserResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return userService.getById(principal.id());
    }

    @PatchMapping("/password")
    @SecurityRequirement(name = "bearerAuth")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            summary = "Cambiar contrasena",
            description = "Cambia la contrasena del usuario autenticado. Requiere la contrasena actual."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Contrasena cambiada."),
            @ApiResponse(responseCode = "400", description = "La contrasena actual no es correcta o la nueva no cumple las reglas."),
            @ApiResponse(responseCode = "401", description = "Falta el token o es invalido/expirado.")
    })
    public void cambiarPassword(@AuthenticationPrincipal UserPrincipal principal,
                                @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(principal.id(), request);
    }
}
