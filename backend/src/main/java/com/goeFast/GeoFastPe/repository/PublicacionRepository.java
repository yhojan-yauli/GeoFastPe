package com.goeFast.GeoFastPe.repository;

import com.goeFast.GeoFastPe.entity.Publicacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublicacionRepository extends JpaRepository<Publicacion, Long> {

    /**
     * Obtiene las publicaciones dentro de un radio (Haversine en metros).
     * EXCLUYE las publicaciones cuya fecha_expiracion ya pasó.
     */
    @Query(value = """
        SELECT p.* FROM publicaciones p
        WHERE (
            6371000 * acos(
                cos(radians(:lat)) * cos(radians(p.latitud)) * cos(radians(p.longitud) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians(p.latitud))
            )
        ) <= :radioMetros
        AND (p.fecha_expiracion IS NULL OR p.fecha_expiracion > NOW())
        ORDER BY p.fecha_creacion DESC
    """, nativeQuery = true)
    List<Publicacion> findCercanos(@Param("lat") Double lat, @Param("lng") Double lng, @Param("radioMetros") Double radioMetros);

    /**
     * Igual que findCercanos, pero solo con las marcadas como emergencia.
     */
    @Query(value = """
        SELECT p.* FROM publicaciones p
        WHERE p.es_emergencia = true
        AND (
            6371000 * acos(
                cos(radians(:lat)) * cos(radians(p.latitud)) * cos(radians(p.longitud) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians(p.latitud))
            )
        ) <= :radioMetros
        AND (p.fecha_expiracion IS NULL OR p.fecha_expiracion > NOW())
        ORDER BY p.fecha_creacion DESC
    """, nativeQuery = true)
    List<Publicacion> findEmergenciasCercanas(@Param("lat") Double lat, @Param("lng") Double lng, @Param("radioMetros") Double radioMetros);
}