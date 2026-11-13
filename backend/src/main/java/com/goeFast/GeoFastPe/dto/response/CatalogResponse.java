package com.goeFast.GeoFastPe.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Catalogos de valores validos y ciudades disponibles. Usa estos valores en los formularios.")
public record CatalogResponse(
        Servicios servicios,
        Ventas ventas,
        Solidaridad solidaridad,
        Emergencias emergencias,
        Reportes reportes,
        Eventos eventos,
        List<String> chats,
        List<Ciudad> ciudades
) {

    public record Servicios(List<String> categorias, List<String> tipos, List<String> ubicaciones, List<String> disponibilidad) {
    }

    public record Ventas(List<String> categorias, List<String> condiciones, List<String> estados, List<String> distritos) {
    }

    public record Solidaridad(List<String> tipos, List<String> categorias, List<String> condicionesDonacion,
                              List<String> urgencias, List<String> estados) {
    }

    public record Emergencias(List<String> tipos, List<String> urgencias, List<String> estados) {
    }

    public record Reportes(List<String> categorias, List<String> prioridades, List<String> estados) {
    }

    public record Eventos(List<String> categorias, List<String> tipos) {
    }

    public record Ciudad(String id, String name, double lat, double lng, int zoom) {
    }
}
