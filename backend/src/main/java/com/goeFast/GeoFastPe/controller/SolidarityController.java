package com.goeFast.GeoFastPe.controller;

import com.goeFast.GeoFastPe.dto.request.SolidarityRequest;
import com.goeFast.GeoFastPe.dto.response.SolidarityResponse;
import com.goeFast.GeoFastPe.security.UserPrincipal;
import com.goeFast.GeoFastPe.service.SolidarityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/solidaridad")
@Tag(name = "Solidaridad", description = "Donaciones y solicitudes de ayuda, con favoritos. Lectura publica; crear, editar, borrar y favoritos requieren token.")
public class SolidarityController {

    private final SolidarityService solidarityService;

    public SolidarityController(SolidarityService solidarityService) {
        this.solidarityService = solidarityService;
    }

    @GetMapping
    @Operation(summary = "Listar donaciones y solicitudes",
            description = "tipo=DONACION para donaciones o tipo=SOLICITUD para solicitudes. Si tienes token, favorito indica cuales marcaste.")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Lista de publicaciones.")})
    public List<SolidarityResponse> listar(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "DONACION o SOLICITUD") @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) com.goeFast.GeoFastPe.entity.EstadoAyuda estadoAyuda) {
        return solidarityService.listar(idOpcional(principal), tipo, categoria, q).stream()
                .filter(p -> estadoAyuda == null || estadoAyuda == p.estadoAyuda()).toList();
    }

    @GetMapping("/favoritos")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Mis favoritos", description = "Publicaciones de solidaridad que marcaste como favoritas.")
    public List<SolidarityResponse> favoritos(@AuthenticationPrincipal UserPrincipal principal) {
        return solidarityService.favoritos(principal.id());
    }

    @GetMapping("/mios")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Mis publicaciones", description = "Donaciones y solicitudes publicadas por el usuario autenticado.")
    public List<SolidarityResponse> misPublicaciones(@AuthenticationPrincipal UserPrincipal principal) {
        return solidarityService.misPublicaciones(principal.id());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Ver una publicacion", description = "Detalle de una donacion o solicitud.")
    @ApiResponses({@ApiResponse(responseCode = "404", description = "Publicacion no encontrada.")})
    public SolidarityResponse obtener(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return solidarityService.obtener(id, idOpcional(principal));
    }

    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Publicar donacion o solicitud",
            description = "tipo=DONACION usa condition (Nuevo, Buen estado o Usado). tipo=SOLICITUD usa urgency (Alta, Media o Baja).")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Publicacion creada."),
            @ApiResponse(responseCode = "400", description = "Datos invalidos."),
            @ApiResponse(responseCode = "401", description = "Falta el token.")
    })
    public SolidarityResponse crear(@AuthenticationPrincipal UserPrincipal principal,
                                    @Valid @RequestBody SolidarityRequest request) {
        return solidarityService.crear(principal.id(), request);
    }

    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Editar publicacion", description = "Solo el creador puede editarla. status puede ser Disponible o Cerrada.")
    @ApiResponses({@ApiResponse(responseCode = "403", description = "No eres el creador.")})
    public SolidarityResponse actualizar(@AuthenticationPrincipal UserPrincipal principal,
                                         @PathVariable Long id,
                                         @Valid @RequestBody SolidarityRequest request) {
        return solidarityService.actualizar(id, principal.id(), request);
    }

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar publicacion", description = "Solo el creador puede eliminarla.")
    @ApiResponses({@ApiResponse(responseCode = "204", description = "Publicacion eliminada.")})
    public void eliminar(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        solidarityService.eliminar(id, principal.id());
    }

    @PutMapping("/{id}/favorito")
    @SecurityRequirement(name = "bearerAuth")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Marcar como favorita", description = "Agrega la publicacion a tus favoritos. Es idempotente.")
    @ApiResponses({@ApiResponse(responseCode = "204", description = "Marcada como favorita.")})
    public void marcarFavorito(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        solidarityService.marcarFavorito(id, principal.id());
    }

    @DeleteMapping("/{id}/favorito")
    @SecurityRequirement(name = "bearerAuth")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Quitar de favoritos", description = "Quita la publicacion de tus favoritos.")
    @ApiResponses({@ApiResponse(responseCode = "204", description = "Quitada de favoritos.")})
    public void quitarFavorito(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        solidarityService.quitarFavorito(id, principal.id());
    }

    private Long idOpcional(UserPrincipal principal) {
        return principal == null ? null : principal.id();
    }
}
