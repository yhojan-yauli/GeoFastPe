package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.dto.response.MapPointResponse;
import com.goeFast.GeoFastPe.repository.EmergencyReportRepository;
import com.goeFast.GeoFastPe.repository.SaleItemRepository;
import com.goeFast.GeoFastPe.repository.ServiceListingRepository;
import com.goeFast.GeoFastPe.repository.SolidarityPostRepository;
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

    private static final List<String> TIPOS = List.of("SERVICIO", "EMERGENCIA", "VENTA", "SOLIDARIDAD");

    private final ServiceListingRepository serviceRepository;
    private final EmergencyReportRepository emergencyRepository;
    private final SaleItemRepository saleRepository;
    private final SolidarityPostRepository solidarityRepository;

    public MapService(ServiceListingRepository serviceRepository,
                      EmergencyReportRepository emergencyRepository,
                      SaleItemRepository saleRepository,
                      SolidarityPostRepository solidarityRepository) {
        this.serviceRepository = serviceRepository;
        this.emergencyRepository = emergencyRepository;
        this.saleRepository = saleRepository;
        this.solidarityRepository = solidarityRepository;
    }

    /** Devuelve los puntos del mapa dentro del radio. tipo es opcional (SERVICIO, EMERGENCIA, VENTA o SOLIDARIDAD). */
    public List<MapPointResponse> puntos(double lat, double lng, Double radio, String tipo) {
        double limite = radio == null ? 1000 : Math.min(Math.max(radio, 100), 50000);
        String filtro = (tipo == null || tipo.isBlank()) ? null : tipo.toUpperCase(Locale.ROOT);
        Validaciones.opcionOpcional("tipo", filtro, TIPOS);

        List<MapPointResponse> puntos = new ArrayList<>();

        if (filtro == null || "SERVICIO".equals(filtro)) {
            serviceRepository.findAllByOrderByCreatedAtDesc().forEach(s -> {
                agregar(puntos, "SERVICIO", s.getId(), s.getTitle(), s.getCategory(), s.getType(),
                        s.getDescription(), s.getLatitude(), s.getLongitude(), lat, lng, limite);
            });
        }

        if (filtro == null || "EMERGENCIA".equals(filtro)) {
            emergencyRepository.findAllByOrderByCreatedAtDesc().forEach(e -> {
                agregar(puntos, "EMERGENCIA", e.getId(), e.getTitle(), null, e.getType(),
                        e.getDescription(), e.getLat(), e.getLng(), lat, lng, limite);
            });
        }

        if (filtro == null || "VENTA".equals(filtro)) {
            saleRepository.findAllByOrderByCreatedAtDesc().forEach(v -> {
                agregar(puntos, "VENTA", v.getId(), v.getName(), v.getCategory(), v.getCondition(),
                        v.getDescription(), v.getLat(), v.getLng(), lat, lng, limite);
            });
        }

        if (filtro == null || "SOLIDARIDAD".equals(filtro)) {
            solidarityRepository.findAllByOrderByCreatedAtDesc().forEach(p -> {
                agregar(puntos, "SOLIDARIDAD", p.getId(), p.getTitle(), p.getCategory(), p.getTipo(),
                        p.getDescription(), p.getLat(), p.getLng(), lat, lng, limite);
            });
        }

        puntos.sort(Comparator.comparingDouble(MapPointResponse::distance));
        return puntos;
    }

    private void agregar(List<MapPointResponse> puntos, String kind, Long id, String title, String category,
                         String type, String description, Double pLat, Double pLng,
                         double lat, double lng, double limite) {
        if (pLat == null || pLng == null) {
            return;
        }
        double distancia = GeoUtils.distanciaMetros(lat, lng, pLat, pLng);
        if (distancia <= limite) {
            puntos.add(new MapPointResponse(kind, id, title, category, type, description, pLat, pLng, distancia));
        }
    }
}
