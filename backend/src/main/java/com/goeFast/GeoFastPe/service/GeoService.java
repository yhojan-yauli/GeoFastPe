package com.goeFast.GeoFastPe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.goeFast.GeoFastPe.config.GeoProperties;
import com.goeFast.GeoFastPe.dto.response.PlaceResponse;
import com.goeFast.GeoFastPe.dto.response.RouteResponse;
import com.goeFast.GeoFastPe.exception.ApiException;
import com.goeFast.GeoFastPe.util.GeoUtils;
import com.goeFast.GeoFastPe.util.Validaciones;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class GeoService {

    private static final String CAMPOS_CLIMA = "temperature_2m,cloud_cover,wind_speed_10m,wind_direction_10m,precipitation,weather_code,relative_humidity_2m";

    private static final Map<String, String> PERFIL_RUTA = Map.of(
            "driving", "routed-car",
            "walking", "routed-foot",
            "cycling", "routed-bike"
    );

    private final RestClient nominatim;
    private final RestClient openMeteo;
    private final RestClient routing;

    public GeoService(GeoProperties properties) {
        this.nominatim = RestClient.builder()
                .baseUrl(properties.nominatimBaseUrl())
                .defaultHeader("User-Agent", properties.userAgent())
                .build();
        this.openMeteo = RestClient.builder().baseUrl(properties.openMeteoBaseUrl()).build();
        this.routing = RestClient.builder().baseUrl(properties.routingBaseUrl()).build();
    }

    public List<PlaceResponse> buscarLugar(String q, Double lat, Double lng) {
        Validaciones.requerir(q != null && !q.isBlank(), "Escribe el lugar a buscar.");

        JsonNode datos;
        try {
            datos = nominatim.get()
                    .uri(uri -> uri.path("/search")
                            .queryParam("q", "{q}")
                            .queryParam("format", "json")
                            .queryParam("limit", 10)
                            .queryParam("addressdetails", 1)
                            .build(q.trim()))
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException ex) {
            throw noDisponible();
        }

        List<PlaceResponse> lugares = new ArrayList<>();
        if (datos != null && datos.isArray()) {
            for (JsonNode nodo : datos) {
                double latitud = Double.parseDouble(nodo.path("lat").asText());
                double longitud = Double.parseDouble(nodo.path("lon").asText());
                String nombreCompleto = nodo.path("display_name").asText();
                String nombre = nombreCompleto.split(",")[0].trim();
                Double distancia = (lat != null && lng != null)
                        ? GeoUtils.distanciaMetros(lat, lng, latitud, longitud)
                        : null;
                lugares.add(new PlaceResponse(nombre, nombreCompleto, latitud, longitud, distancia));
            }
        }

        if (lat != null && lng != null) {
            lugares.sort((a, b) -> Double.compare(a.distance(), b.distance()));
        }
        return lugares;
    }

    public JsonNode clima(double lat, double lng) {
        JsonNode datos;
        try {
            datos = openMeteo.get()
                    .uri(uri -> uri.path("/v1/forecast")
                            .queryParam("latitude", "{lat}")
                            .queryParam("longitude", "{lng}")
                            .queryParam("current", CAMPOS_CLIMA)
                            .queryParam("timezone", "auto")
                            .build(lat, lng))
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException ex) {
            throw noDisponible();
        }
        if (datos == null || datos.path("current").isMissingNode()) {
            throw noDisponible();
        }
        return datos.path("current");
    }

    public RouteResponse ruta(String modo, double origenLat, double origenLng, double destinoLat, double destinoLng) {
        Validaciones.requerirOpcion("modo", modo, List.copyOf(PERFIL_RUTA.keySet()));
        String coordenadas = String.format(Locale.US, "%f,%f;%f,%f", origenLng, origenLat, destinoLng, destinoLat);
        String perfil = PERFIL_RUTA.get(modo);

        JsonNode datos;
        try {
            datos = routing.get()
                    .uri(uri -> uri.path("/" + perfil + "/route/v1/driving/{coordenadas}")
                            .queryParam("overview", "full")
                            .queryParam("geometries", "geojson")
                            .build(coordenadas))
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException ex) {
            throw noDisponible();
        }

        if (datos == null || !"Ok".equals(datos.path("code").asText()) || datos.path("routes").isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ROUTE_NOT_FOUND", "No se pudo calcular la ruta.");
        }

        JsonNode primera = datos.path("routes").get(0);
        return new RouteResponse(
                primera.path("distance").asDouble(),
                primera.path("duration").asDouble(),
                primera.path("geometry")
        );
    }

    private ApiException noDisponible() {
        return new ApiException(HttpStatus.BAD_GATEWAY, "GEO_SERVICE_UNAVAILABLE",
                "El servicio geografico externo no esta disponible en este momento.");
    }
}
