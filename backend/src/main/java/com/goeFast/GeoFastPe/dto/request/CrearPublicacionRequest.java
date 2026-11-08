package com.goeFast.GeoFastPe.dto.request;

import com.goeFast.GeoFastPe.entity.Publicacion.CategoriaPublicacion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CrearPublicacionRequest {
    @NotBlank
    private String titulo;

    @NotBlank
    private String descripcion;

    @NotNull
    private CategoriaPublicacion categoria;

    @NotNull
    private Double latitud;

    @NotNull
    private Double longitud;

    private Boolean esEmergencia = false;

    /**
     * Opcional: Fecha en la que la publicación deja de mostrarse en el mapa.
     * Si no se envía, la publicación es permanente.
     * Formato ISO: "2026-11-08T18:00:00"
     */
    private LocalDateTime fechaExpiracion;
}