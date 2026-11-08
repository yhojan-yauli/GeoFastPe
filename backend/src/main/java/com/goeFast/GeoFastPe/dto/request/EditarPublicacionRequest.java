package com.goeFast.GeoFastPe.dto.request;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO específico para editar una publicación.
 * No incluye campos que no deben modificarse (id, autor, votos, fechaCreacion).
 */
@Data
public class EditarPublicacionRequest {
    private String titulo;
    private String descripcion;
    private Boolean esEmergencia;
    private LocalDateTime fechaExpiracion;
}