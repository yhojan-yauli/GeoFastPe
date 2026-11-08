package com.goeFast.GeoFastPe.controller;

import com.goeFast.GeoFastPe.dto.request.CrearPublicacionRequest;
import com.goeFast.GeoFastPe.dto.request.EditarPublicacionRequest;
import com.goeFast.GeoFastPe.dto.response.PublicacionResponse;
import com.goeFast.GeoFastPe.service.PublicacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/publicaciones")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicacionController {

    private final PublicacionService service;

    // 1. CREAR
    @PostMapping
    public ResponseEntity<PublicacionResponse> crear(@Valid @RequestBody CrearPublicacionRequest request) {
        return ResponseEntity.ok(service.crear(request));
    }

    // 2. LEER (cercanos)
    @GetMapping("/cercanos")
    public ResponseEntity<List<PublicacionResponse>> obtenerCercanos(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "1000") Double radio) {
        return ResponseEntity.ok(service.obtenerCercanos(lat, lng, radio));
    }

    // 3. LEER (emergencias)
    @GetMapping("/emergencias")
    public ResponseEntity<List<PublicacionResponse>> obtenerEmergencias(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "5000") Double radio) {
        return ResponseEntity.ok(service.obtenerEmergencias(lat, lng, radio));
    }

    // 4. EDITAR
    @PutMapping("/{id}")
    public ResponseEntity<PublicacionResponse> editar(
            @PathVariable Long id,
            @RequestBody EditarPublicacionRequest request) {
        return ResponseEntity.ok(service.editar(id, request));
    }

    // 5. ELIMINAR
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.ok(Map.of("mensaje", "Publicación eliminada con ID: " + id));
    }

    // 6. VISTO BUENO
    @PostMapping("/{id}/visto-bueno")
    public ResponseEntity<PublicacionResponse> darVistoBueno(@PathVariable Long id) {
        return ResponseEntity.ok(service.darVistoBueno(id));
    }
}