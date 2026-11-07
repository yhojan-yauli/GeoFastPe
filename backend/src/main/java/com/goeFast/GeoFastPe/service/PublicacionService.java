package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.dto.request.CrearPublicacionRequest;
import com.goeFast.GeoFastPe.dto.response.PublicacionResponse;
import com.goeFast.GeoFastPe.entity.Publicacion;
import com.goeFast.GeoFastPe.repository.PublicacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicacionService {

    private final PublicacionRepository repository;

    public PublicacionResponse crear(CrearPublicacionRequest req) {
        Publicacion p = new Publicacion();
        p.setTitulo(req.getTitulo());
        p.setDescripcion(req.getDescripcion());
        p.setCategoria(req.getCategoria());
        p.setLatitud(req.getLatitud());
        p.setLongitud(req.getLongitud());
        p.setEsEmergencia(req.getEsEmergencia());
        
        // Obtener usuario del token JWT (Asumiendo que usas Spring Security)
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        p.setAutorUsername(username);

        Publicacion saved = repository.save(p);
        return mapToResponse(saved);
    }

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
    
    // Para el Visto Bueno Vecinal
    public PublicacionResponse darVistoBueno(Long id) {
        Publicacion p = repository.findById(id).orElseThrow(() -> new RuntimeException("No encontrado"));
        p.setVotosPositivos(p.getVotosPositivos() + 1);
        return mapToResponse(repository.save(p));
    }

    private PublicacionResponse mapToResponse(Publicacion p) {
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
                .build();
    }
}