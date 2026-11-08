package com.goeFast.GeoFastPe.controller;

import com.goeFast.GeoFastPe.dto.response.SolidarityResponse;
import com.goeFast.GeoFastPe.security.UserPrincipal;
import com.goeFast.GeoFastPe.service.CoordinacionAyudaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;

@io.swagger.v3.oas.annotations.tags.Tag(name="Coordinacion de ayuda")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name="bearerAuth")
@RestController @RequiredArgsConstructor
@RequestMapping("/api/v1/solidaridad")
public class CoordinacionAyudaController {
    private final CoordinacionAyudaService service;

    // 1. Consultar las entregas que el solicitante todavia debe confirmar.
    @GetMapping("/pendientes-confirmacion")
    public List<SolidarityResponse> pendientes(@AuthenticationPrincipal UserPrincipal user) {
        return service.pendientes(user.id());
    }

    // 2. Consultar el historial de ayudas aceptadas por el voluntario autenticado.
    @GetMapping("/asignadas")
    public List<SolidarityResponse> asignadas(@AuthenticationPrincipal UserPrincipal user) {
        return service.asignadas(user.id());
    }

    // 3. Tomar, reportar entrega, resolver, cancelar o rechazar una entrega de la solicitud existente.
    @PostMapping("/{id}/{accion:tomar|entrega|resolver|cancelar|rechazar-entrega}")
    public SolidarityResponse actuar(@PathVariable Long id, @PathVariable String accion,
                                    @AuthenticationPrincipal UserPrincipal user) {
        return service.actuar(id, user.id(), accion);
    }
}
