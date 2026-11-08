package com.goeFast.GeoFastPe.controller;

import com.goeFast.GeoFastPe.dto.response.MapPointResponse;
import com.goeFast.GeoFastPe.service.MapService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mapa")
@Tag(name = "Mapa", description = "Puntos del mapa vecinal (servicios y emergencias) dentro de un radio. Publico.")
public class MapController {

    private final MapService mapService;

    public MapController(MapService mapService) {
        this.mapService = mapService;
    }

    @GetMapping("/puntos")
    @Operation(summary = "Puntos cercanos",
            description = "Devuelve servicios, emergencias, ventas y donaciones/solicitudes con coordenadas dentro del radio, ordenados por distancia. tipo (opcional): SERVICIO, EMERGENCIA, VENTA o SOLIDARIDAD.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Puntos dentro del radio."),
            @ApiResponse(responseCode = "400", description = "Parametros invalidos.")
    })
    public List<MapPointResponse> puntos(
            @Parameter(description = "Latitud del centro", required = true, example = "-16.409047")
            @RequestParam double lat,
            @Parameter(description = "Longitud del centro", required = true, example = "-71.537451")
            @RequestParam double lng,
            @Parameter(description = "Radio en metros (100 a 50000)", example = "1000")
            @RequestParam(required = false) Double radio,
            @Parameter(description = "SERVICIO, EMERGENCIA, VENTA o SOLIDARIDAD") @RequestParam(required = false) String tipo) {
        return mapService.puntos(lat, lng, radio, tipo);
    }
}
