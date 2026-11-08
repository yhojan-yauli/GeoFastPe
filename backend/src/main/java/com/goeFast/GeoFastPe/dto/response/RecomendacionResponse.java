package com.goeFast.GeoFastPe.dto.response;
import java.time.Instant;
public record RecomendacionResponse(Long id, Long autorId, String autorNombre,
                                    int puntuacion, String comentario, Instant actualizadaEn) {}
