package com.goeFast.GeoFastPe.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.goeFast.GeoFastPe.dto.response.PlaceResponse;
import com.goeFast.GeoFastPe.dto.response.RouteResponse;
import com.goeFast.GeoFastPe.service.GeoService;
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
@RequestMapping("/api/v1/geo")
@Tag(name = "Geo", description = "Busqueda de lugares, clima y rutas. La app consulta estos endpoints y el backend llama a los servicios externos.")
public class GeoController {

    private final GeoService geoService;

    public GeoController(GeoService geoService) {
        this.geoService = geoService;
    }

    @GetMapping("/buscar")
    @Operation(summary = "Buscar un lugar",
            description = "Busca direcciones o lugares. Si envias lat y lng, incluye la distancia y ordena por cercania.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lugares encontrados."),
            @ApiResponse(responseCode = "502", description = "El servicio externo no responde.")
    })
    public List<PlaceResponse> buscar(
            @Parameter(description = "Texto a buscar", example = "Plaza de Armas Arequipa") @RequestParam String q,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        return geoService.buscarLugar(q, lat, lng);
    }

    @GetMapping("/clima")
    @Operation(summary = "Clima actual",
            description = "Devuelve el bloque 'current' de Open-Meteo: temperature_2m, cloud_cover, wind_speed_10m, wind_direction_10m, precipitation, weather_code y relative_humidity_2m.")
    @ApiResponses({@ApiResponse(responseCode = "502", description = "El servicio de clima no responde.")})
    public JsonNode clima(
            @Parameter(description = "Latitud", required = true, example = "-16.409047") @RequestParam double lat,
            @Parameter(description = "Longitud", required = true, example = "-71.537451") @RequestParam double lng) {
        return geoService.clima(lat, lng);
    }

    @GetMapping("/ruta")
    @Operation(summary = "Calcular ruta",
            description = "Ruta entre origen y destino. modo: driving (auto), walking (a pie) o cycling (bici). geometry es un LineString GeoJSON.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Ruta calculada."),
            @ApiResponse(responseCode = "400", description = "No se pudo calcular la ruta.")
    })
    public RouteResponse ruta(
            @RequestParam(defaultValue = "driving") String modo,
            @RequestParam double origenLat,
            @RequestParam double origenLng,
            @RequestParam double destinoLat,
            @RequestParam double destinoLng) {
        return geoService.ruta(modo, origenLat, origenLng, destinoLat, destinoLng);
    }
}
