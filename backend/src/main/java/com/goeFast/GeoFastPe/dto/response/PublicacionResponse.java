package com.goeFast.GeoFastPe.dto.response;

import java.time.LocalDateTime;

import com.goeFast.GeoFastPe.entity.Publicacion.CategoriaPublicacion;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PublicacionResponse {
    private Long id;
    private String titulo;
    private String descripcion;
    private CategoriaPublicacion categoria;
    private Double latitud;
    private Double longitud;
    private Integer votosPositivos;
    private String autorUsername;
    private LocalDateTime fechaCreacion;
    private Boolean esEmergencia;
    private LocalDateTime fechaExpiracion;
    private Boolean expirada; // ← Nuevo: indica si ya expirado
}