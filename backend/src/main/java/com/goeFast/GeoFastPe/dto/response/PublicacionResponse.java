package com.goeFast.GeoFastPe.dto.response;

import com.goeFast.GeoFastPe.entity.Publicacion.CategoriaPublicacion;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

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
}