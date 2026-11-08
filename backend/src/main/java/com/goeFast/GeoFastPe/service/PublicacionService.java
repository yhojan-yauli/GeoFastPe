package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.dto.request.CrearPublicacionRequest;
import com.goeFast.GeoFastPe.dto.request.EditarPublicacionRequest;
import com.goeFast.GeoFastPe.dto.response.PublicacionResponse;
import com.goeFast.GeoFastPe.entity.Publicacion;
import com.goeFast.GeoFastPe.repository.PublicacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicacionService {

    private final PublicacionRepository repository;

    // ─────────────────────────────────────────────────────────
    // CREAR
    // ─────────────────────────────────────────────────────────
    public PublicacionResponse crear(CrearPublicacionRequest req) {
        Publicacion p = new Publicacion();
        p.setTitulo(req.getTitulo());
        p.setDescripcion(req.getDescripcion());
        p.setCategoria(req.getCategoria());
        p.setLatitud(req.getLatitud());
        p.setLongitud(req.getLongitud());
        p.setEsEmergencia(req.getEsEmergencia());
        p.setFechaExpiracion(req.getFechaExpiracion());

        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            p.setAutorUsername(username);
        } catch (Exception e) {
            p.setAutorUsername("anonymousUser");
        }

        Publicacion saved = repository.save(p);
        return mapToResponse(saved);
    }

    // ─────────────────────────────────────────────────────────
    // LEER (cercanos / emergencias)
    // ─────────────────────────────────────────────────────────
    public List<PublicacionResponse> obtenerCercanos(Double lat, Double lng, Double radio) {
        return repository.findCercanos(lat, lng, radio).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<PublicacionResponse> obtenerEmergencias(Double lat, Double lng, Double radio) {
        return repository.findEmergenciasCercanas(lat, lng, radio).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────
    // EDITAR
    // ─────────────────────────────────────────────────────────
    public PublicacionResponse editar(Long id, EditarPublicacionRequest req) {
        Publicacion p = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publicación no encontrada con ID: " + id));

        // Solo actualiza los campos que se envían (no nulos)
        if (req.getTitulo() != null) p.setTitulo(req.getTitulo());
        if (req.getDescripcion() != null) p.setDescripcion(req.getDescripcion());
        if (req.getEsEmergencia() != null) p.setEsEmergencia(req.getEsEmergencia());
        if (req.getFechaExpiracion() != null) p.setFechaExpiracion(req.getFechaExpiracion());

        return mapToResponse(repository.save(p));
    }

    // ─────────────────────────────────────────────────────────
    // ELIMINAR (Hard Delete)
    // ─────────────────────────────────────────────────────────
    public void eliminar(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Publicación no encontrada con ID: " + id);
        }
        repository.deleteById(id);
    }

    // ─────────────────────────────────────────────────────────
    // VISTO BUENO
    // ─────────────────────────────────────────────────────────
    public PublicacionResponse darVistoBueno(Long id) {
        Publicacion p = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publicación no encontrada"));
        p.setVotosPositivos(p.getVotosPositivos() + 1);
        return mapToResponse(repository.save(p));
    }

    // ─────────────────────────────────────────────────────────
    // MAPPER
    // ─────────────────────────────────────────────────────────
    private PublicacionResponse mapToResponse(Publicacion p) {
        boolean expirada = p.getFechaExpiracion() != null
                && p.getFechaExpiracion().isBefore(LocalDateTime.now());

        return PublicacionResponse.builder()
                .id(p.getId())
                .titulo(p.getTitulo())
                .descripcion(p.getDescripcion())
                .categoria(p.getCategoria())
                .latitud(p.getLatitud())
                .longitud(p.getLongitud())
                .votosPositivos(p.getVotosPositivos())
                .autorUsername(p.getAutorUsername())
                .fechaCreacion(p.getFechaCreacion())
                .esEmergencia(p.getEsEmergencia())
                .fechaExpiracion(p.getFechaExpiracion())
                .expirada(expirada)
                .build();
    }
}