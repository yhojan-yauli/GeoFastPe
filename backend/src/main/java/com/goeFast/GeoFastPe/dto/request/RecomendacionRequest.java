package com.goeFast.GeoFastPe.dto.request;
import jakarta.validation.constraints.*;
public record RecomendacionRequest(@NotNull @Min(1) @Max(5) Integer puntuacion,
                                   @Size(max=500) String comentario) {}
