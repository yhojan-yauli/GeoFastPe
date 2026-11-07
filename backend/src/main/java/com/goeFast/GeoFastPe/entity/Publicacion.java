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

    // Categoría: EVENTO, NOTICIA, SERVICIO (Gasfitería, Cerrajería, etc.)
    @Enumerated(EnumType.STRING)
    private CategoriaPublicacion categoria;

    // Ubicación
    private Double latitud;
    private Double longitud;

    // Para el "Visto Bueno Vecinal" (Recomendaciones)
    private Integer votosPositivos = 0;

    // Control
    private String autorUsername;
    private LocalDateTime fechaCreacion = LocalDateTime.now();
    
    // Para emergencias
    private Boolean esEmergencia = false;

    public enum CategoriaPublicacion {
        EVENTO, NOTICIA, SERVICIO
    }
}