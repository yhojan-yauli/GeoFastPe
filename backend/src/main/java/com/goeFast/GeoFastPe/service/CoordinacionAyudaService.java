package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.entity.*;
import com.goeFast.GeoFastPe.dto.response.SolidarityResponse;
import com.goeFast.GeoFastPe.repository.*;
import com.goeFast.GeoFastPe.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import java.time.Instant;
import java.util.List;

@Service @RequiredArgsConstructor
public class CoordinacionAyudaService {
    private final SolidarityPostRepository posts;
    private final UserRepository users;

    // Bloqueo por solicitud: otras ayudas pueden atenderse en paralelo.
    @Transactional
    public SolidarityResponse actuar(Long id, Long userId, String accion) {
        var p = posts.findForUpdate(id).orElseThrow(() -> error(HttpStatus.NOT_FOUND, "SOLIDARITY_NOT_FOUND"));
        if (!"SOLICITUD".equals(p.getTipo())) throw error(HttpStatus.CONFLICT, "NOT_HELP_REQUEST");
        var estado = estado(p);
        boolean autor = p.getOwner().getId().equals(userId);
        boolean voluntario = p.getVoluntario() != null && p.getVoluntario().getId().equals(userId);
        switch (accion) {
            case "tomar" -> {
                if (autor) throw error(HttpStatus.FORBIDDEN, "SELF_ASSIGNMENT");
                if (voluntario && estado == EstadoAyuda.EN_ATENCION) break;
                exigir(estado == EstadoAyuda.ABIERTA);
                p.setVoluntario(users.findById(userId).filter(User::isActive)
                        .orElseThrow(() -> error(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED")));
                p.setEstadoAyuda(EstadoAyuda.EN_ATENCION);
            }
            case "entrega" -> {
                if (!voluntario) throw error(HttpStatus.FORBIDDEN, "NOT_VOLUNTEER");
                if (estado == EstadoAyuda.PENDIENTE_CONFIRMACION) break;
                exigir(estado == EstadoAyuda.EN_ATENCION);
                p.setEstadoAyuda(EstadoAyuda.PENDIENTE_CONFIRMACION);
                p.setEntregaReportadaEn(Instant.now());
            }
            case "resolver" -> {
                if (!autor) throw error(HttpStatus.FORBIDDEN, "NOT_OWNER");
                if (estado == EstadoAyuda.RESUELTA) break;
                exigir(estado == EstadoAyuda.EN_ATENCION || estado == EstadoAyuda.PENDIENTE_CONFIRMACION);
                p.setEstadoAyuda(EstadoAyuda.RESUELTA); p.setStatus("Cerrada");
            }
            case "cancelar" -> {
                if (!autor) throw error(HttpStatus.FORBIDDEN, "NOT_OWNER");
                if (estado == EstadoAyuda.CANCELADA) break;
                exigir(estado != EstadoAyuda.RESUELTA);
                p.setEstadoAyuda(EstadoAyuda.CANCELADA); p.setStatus("Cerrada");
            }
            case "rechazar-entrega" -> {
                if (!autor) throw error(HttpStatus.FORBIDDEN, "NOT_OWNER");
                exigir(estado == EstadoAyuda.PENDIENTE_CONFIRMACION);
                p.setEstadoAyuda(EstadoAyuda.EN_ATENCION); p.setEntregaReportadaEn(null);
            }
            default -> throw error(HttpStatus.BAD_REQUEST, "INVALID_ACTION");
        }
        return SolidarityResponse.from(posts.saveAndFlush(p), false);
    }

    // Recordatorios consultables al volver a entrar; no se considera el silencio una confirmacion.
    @Transactional(readOnly = true)
    public List<SolidarityResponse> pendientes(Long userId) {
        return posts.findAllByOwnerIdOrderByCreatedAtDesc(userId).stream()
                .filter(p -> estado(p) == EstadoAyuda.PENDIENTE_CONFIRMACION)
                .map(p -> SolidarityResponse.from(p, false)).toList();
    }

    @Transactional(readOnly = true)
    public List<SolidarityResponse> asignadas(Long userId) {
        return posts.findAllByVoluntarioIdOrderByCreatedAtDesc(userId).stream()
                .map(p -> SolidarityResponse.from(p, false)).toList();
    }

    public static EstadoAyuda estado(SolidarityPost p) {
        return p.getEstadoAyuda() != null ? p.getEstadoAyuda() :
            ("Cerrada".equals(p.getStatus()) ? EstadoAyuda.CANCELADA : EstadoAyuda.ABIERTA);
    }
    private void exigir(boolean ok) { if (!ok) throw error(HttpStatus.CONFLICT, "HELP_STATE_CONFLICT"); }
    private ApiException error(HttpStatus status, String code) {
        return new ApiException(status, code, "Operacion de ayuda no permitida: " + code);
    }
}
