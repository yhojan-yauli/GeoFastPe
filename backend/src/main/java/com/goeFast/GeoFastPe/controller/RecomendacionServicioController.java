package com.goeFast.GeoFastPe.controller;
import com.goeFast.GeoFastPe.service.RecomendacionServicioService;
import com.goeFast.GeoFastPe.dto.request.RecomendacionRequest;
import com.goeFast.GeoFastPe.dto.response.ServiceResponse;
import com.goeFast.GeoFastPe.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@io.swagger.v3.oas.annotations.tags.Tag(name="Recomendaciones de servicios")
@RestController @RequiredArgsConstructor
@RequestMapping("/api/v1/servicios/{id}")
public class RecomendacionServicioController {
    private final RecomendacionServicioService service;
    // 1. Guardar o actualizar la recomendacion del vecino autenticado (puntuacion de 1 a 5).
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name="bearerAuth")
    @PutMapping("/recomendacion")
    public ServiceResponse guardar(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal user,
                                   @Valid @RequestBody RecomendacionRequest req) {
        return service.guardar(id,user.id(),req);
    }
    // 2. Retirar la recomendacion propia y recalcular la puntuacion del servicio.
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name="bearerAuth")
    @DeleteMapping("/recomendacion")
    public ServiceResponse eliminar(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal user) {
        return service.eliminar(id,user.id());
    }
    // 3. Consultar las recomendaciones sin exponer correo ni telefono de sus autores.
    @GetMapping("/recomendaciones")
    public java.util.List<com.goeFast.GeoFastPe.dto.response.RecomendacionResponse> listar(@PathVariable Long id) {
        return service.listar(id);
    }
}
