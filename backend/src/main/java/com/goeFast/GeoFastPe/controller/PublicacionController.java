package com.goeFast.GeoFastPe.controller;

import com.goeFast.GeoFastPe.dto.request.CrearPublicacionRequest;
import com.goeFast.GeoFastPe.dto.response.PublicacionResponse;
import com.goeFast.GeoFastPe.service.PublicacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/publicaciones")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Para que tu frontend HTML pueda consumirlo
public class PublicacionController {

    private final PublicacionService service;

    // 1. Crear publicación desde el mapa (máximo 3 clics en frontend)
    @PostMapping
    public ResponseEntity<PublicacionResponse> crear(@Valid @RequestBody CrearPublicacionRequest request) {
        return ResponseEntity.ok(service.crear(request));
    }

    // 2. Obtener puntos para pintar en el mapa (Eventos, Noticias, Servicios)
    @GetMapping("/cercanos")
    public ResponseEntity<List<PublicacionResponse>> obtenerCercanos(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "1000") Double radio) {
        return ResponseEntity.ok(service.obtenerCercanos(lat, lng, radio));
    }

    // 3. Modo Emergencia (Solo los marcados como emergencia)
    @GetMapping("/emergencias")
    public ResponseEntity<List<PublicacionResponse>> obtenerEmergencias(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "5000") Double radio) {
        return ResponseEntity.ok(service.obtenerEmergencias(lat, lng, radio));
    }

    // 4. Visto Bueno Vecinal (Recomendar)
    @PostMapping("/{id}/visto-bueno")
    public ResponseEntity<PublicacionResponse> darVistoBueno(@PathVariable Long id) {
        return ResponseEntity.ok(service.darVistoBueno(id));
    }
}