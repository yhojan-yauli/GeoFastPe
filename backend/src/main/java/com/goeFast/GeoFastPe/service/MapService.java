package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.dto.response.MapPointResponse;
import com.goeFast.GeoFastPe.repository.EmergencyReportRepository;
import com.goeFast.GeoFastPe.repository.ServiceListingRepository;
import com.goeFast.GeoFastPe.util.GeoUtils;
import com.goeFast.GeoFastPe.util.Validaciones;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class MapService {

    private final ServiceListingRepository serviceRepository;
    private final EmergencyReportRepository emergencyRepository;

    public MapService(ServiceListingRepository serviceRepository, EmergencyReportRepository emergencyRepository) {
        this.serviceRepository = serviceRepository;
        this.emergencyRepository = emergencyRepository;
    }

    public List<MapPointResponse> puntos(double lat, double lng, Double radio, String tipo) {
        double limite = radio == null ? 1000 : Math.min(Math.max(radio, 100), 50000);
        String filtro = (tipo == null || tipo.isBlank()) ? null : tipo.toUpperCase(Locale.ROOT);
        Validaciones.opcionOpcional("tipo", filtro, List.of("SERVICIO", "EMERGENCIA"));

        List<MapPointResponse> puntos = new ArrayList<>();

        if (filtro == null || "SERVICIO".equals(filtro)) {
            serviceRepository.findAllByOrderByCreatedAtDesc().forEach(s -> {
                if (s.getLatitude() == null || s.getLongitude() == null) {
                    return;
                }
                double distancia = GeoUtils.distanciaMetros(lat, lng, s.getLatitude(), s.getLongitude());
                if (distancia <= limite) {
                    puntos.add(new MapPointResponse("SERVICIO", s.getId(), s.getTitle(), s.getCategory(),
                            s.getType(), s.getDescription(), s.getLatitude(), s.getLongitude(), distancia));
                }
            });
        }

        if (filtro == null || "EMERGENCIA".equals(filtro)) {
            emergencyRepository.findAllByOrderByCreatedAtDesc().forEach(e -> {
                if (e.getLat() == null || e.getLng() == null) {
                    return;
                }
                double distancia = GeoUtils.distanciaMetros(lat, lng, e.getLat(), e.getLng());
                if (distancia <= limite) {
                    puntos.add(new MapPointResponse("EMERGENCIA", e.getId(), e.getTitle(), null,
                            e.getType(), e.getDescription(), e.getLat(), e.getLng(), distancia));
                }
            });
        }

        puntos.sort(Comparator.comparingDouble(MapPointResponse::distance));
        return puntos;
    }
}
