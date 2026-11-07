package com.goeFast.GeoFastPe.dto.request;

import com.goeFast.GeoFastPe.entity.Publicacion.CategoriaPublicacion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

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
}