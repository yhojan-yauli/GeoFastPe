package com.goeFast.GeoFastPe.repository;
import com.goeFast.GeoFastPe.entity.RecomendacionServicio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface RecomendacionServicioRepository extends JpaRepository<RecomendacionServicio,Long> {
    Optional<RecomendacionServicio> findByServicioIdAndUsuarioId(Long servicioId, Long usuarioId);
    List<RecomendacionServicio> findAllByServicioId(Long servicioId);
    void deleteAllByServicioId(Long servicioId);
}
