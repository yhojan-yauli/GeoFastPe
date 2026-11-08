package com.goeFast.GeoFastPe.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "publicaciones")
@Data
@NoArgsConstructor
public class Publicacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String descripcion;

    @Enumerated(EnumType.STRING)
    private CategoriaPublicacion categoria;

    private Double latitud;
    private Double longitud;

    private Integer votosPositivos = 0;

    private String autorUsername;
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    /**
     * Fecha opcional de expiración. Si es null, la publicación nunca expira.
     * Si tiene fecha, el backend la ignorará en las búsquedas después de esa fecha.
     */
    private LocalDateTime fechaExpiracion;

    private Boolean esEmergencia = false;

    public enum CategoriaPublicacion {
        EVENTO, NOTICIA, SERVICIO
    }
}