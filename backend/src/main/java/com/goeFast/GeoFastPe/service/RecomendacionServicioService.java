package com.goeFast.GeoFastPe.service;
import com.goeFast.GeoFastPe.entity.*;
import com.goeFast.GeoFastPe.repository.*;
import com.goeFast.GeoFastPe.dto.request.RecomendacionRequest;
import com.goeFast.GeoFastPe.dto.response.ServiceResponse;
import com.goeFast.GeoFastPe.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import java.time.Instant;

@Service @RequiredArgsConstructor
public class RecomendacionServicioService {
    private final RecomendacionServicioRepository recomendaciones;
    private final ServiceListingRepository servicios;
    private final UserRepository users;

    // Una valoracion por usuario y servicio. PUT reemplaza la propia, no suma votos repetidos.
    @Transactional
    public ServiceResponse guardar(Long id, Long userId, RecomendacionRequest req) {
        var s = bloquear(id);
        if (s.getOwner().getId().equals(userId)) throw new ApiException(HttpStatus.FORBIDDEN,
                "SELF_RECOMMENDATION", "No puedes recomendar tu propio servicio.");
        var r = recomendaciones.findByServicioIdAndUsuarioId(id,userId).orElseGet(RecomendacionServicio::new);
        r.setServicio(s); r.setUsuario(users.getReferenceById(userId));
        r.setPuntuacion(req.puntuacion()); r.setComentario(req.comentario()); r.setActualizadaEn(Instant.now());
        recomendaciones.saveAndFlush(r);
        return recalcular(s);
    }
    @Transactional
    public ServiceResponse eliminar(Long id, Long userId) {
        var s = bloquear(id);
        recomendaciones.findByServicioIdAndUsuarioId(id,userId).ifPresent(recomendaciones::delete);
        recomendaciones.flush();
        return recalcular(s);
    }
    @Transactional(readOnly=true)
    public java.util.List<com.goeFast.GeoFastPe.dto.response.RecomendacionResponse> listar(Long id) {
        if (!servicios.existsById(id)) throw new ApiException(HttpStatus.NOT_FOUND,
                "SERVICE_NOT_FOUND", "Servicio no encontrado.");
        return recomendaciones.findAllByServicioId(id).stream()
                .sorted(java.util.Comparator.comparing(RecomendacionServicio::getActualizadaEn).reversed())
                .map(r -> new com.goeFast.GeoFastPe.dto.response.RecomendacionResponse(r.getId(),
                        r.getUsuario().getId(), r.getUsuario().getName(), r.getPuntuacion(),
                        r.getComentario(), r.getActualizadaEn())).toList();
    }

    private ServiceListing bloquear(Long id) {
        return servicios.findForUpdate(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                "SERVICE_NOT_FOUND", "Servicio no encontrado."));
    }
    private ServiceResponse recalcular(ServiceListing s) {
        var lista = recomendaciones.findAllByServicioId(s.getId());
        s.setRecommendationCount(lista.size());
        s.setRating(lista.stream().mapToInt(RecomendacionServicio::getPuntuacion).average().orElse(0));
        return ServiceResponse.from(servicios.saveAndFlush(s));
    }
}
