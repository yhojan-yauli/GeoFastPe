package com.goeFast.GeoFastPe.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Archivo guardado. Usa la url en los campos image, images o avatar.")
public record FileUploadResponse(
        @Schema(example = "/api/v1/archivos/3f2a9c1e-7b8d-4c2a-9e1f-5a6b7c8d9e0f.jpg")
        String url,
        String contentType,
        long size
) {
}
