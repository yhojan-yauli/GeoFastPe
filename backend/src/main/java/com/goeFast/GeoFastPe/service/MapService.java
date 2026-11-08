package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.dto.response.MapPointResponse;
import com.goeFast.GeoFastPe.repository.CitizenReportRepository;
import com.goeFast.GeoFastPe.repository.CommunityEventRepository;
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
    private static final List<String> TIPOS = List.of("SERVICIO", "EMERGENCIA", "VENTA", "SOLIDARIDAD", "EVENTO", "REPORTE");

    private final ServiceListingRepository serviceRepository;
    private final EmergencyReportRepository emergencyRepository;
    private final SaleItemRepository saleRepository;
    private final SolidarityPostRepository solidarityRepository;
    private final CommunityEventRepository eventRepository;
    private final CitizenReportRepository reportRepository;

    public MapService(ServiceListingRepository serviceRepository, EmergencyReportRepository emergencyRepository,
                      SaleItemRepository saleRepository, SolidarityPostRepository solidarityRepository,
                      CommunityEventRepository eventRepository, CitizenReportRepository reportRepository) {
        this.serviceRepository = serviceRepository;
        this.emergencyRepository = emergencyRepository;
        this.saleRepository = saleRepository;
        this.solidarityRepository = solidarityRepository;
        this.eventRepository = eventRepository;
        this.reportRepository = reportRepository;
    }

    public List<MapPointResponse> puntos(double lat, double lng, Double radio, String tipo) {
        double limite = radio == null ? 1000 : Math.min(Math.max(radio, 100), 50000);
        String filtro = (tipo == null || tipo.isBlank()) ? null : tipo.toUpperCase(Locale.ROOT);
        Validaciones.opcionOpcional("tipo", filtro, TIPOS);
        List<MapPointResponse> puntos = new ArrayList<>();

        if (filtro == null || "SERVICIO".equals(filtro)) serviceRepository.findAllByOrderByCreatedAtDesc().forEach(s ->
                agregar(puntos, "SERVICIO", s.getId(), s.getTitle(), s.getCategory(), s.getType(), s.getDescription(),
                        s.getLatitude(), s.getLongitude(), lat, lng, limite, s.getAddress(), null, null, s.getOwner().getName(), s.getImage(), null, null));

        if (filtro == null || "EMERGENCIA".equals(filtro)) emergencyRepository.findAllByOrderByCreatedAtDesc().forEach(e ->
                agregar(puntos, "EMERGENCIA", e.getId(), e.getTitle(), null, e.getType(), e.getDescription(), e.getLat(), e.getLng(),
                        lat, lng, limite, e.getLocationText(), e.getStatus(), e.getUrgency(), e.getReporter().getName(), e.getImages() == null || e.getImages().isEmpty() ? null : e.getImages().get(0), null, null));

        if (filtro == null || "VENTA".equals(filtro)) saleRepository.findAllByOrderByCreatedAtDesc().forEach(v ->
                agregar(puntos, "VENTA", v.getId(), v.getName(), v.getCategory(), v.getCondition(), v.getDescription(), v.getLat(), v.getLng(),
                        lat, lng, limite, v.getLocation(), v.getStatus(), null, v.getOwner().getName(), v.getImage(), null, null));

        if (filtro == null || "SOLIDARIDAD".equals(filtro)) solidarityRepository.findAllByOrderByCreatedAtDesc().forEach(p ->
                agregar(puntos, "SOLIDARIDAD", p.getId(), p.getTitle(), p.getCategory(), p.getTipo(), p.getDescription(), p.getLat(), p.getLng(),
                        lat, lng, limite, p.getLocation(), p.getStatus(), null, p.getOwner().getName(), p.getImage(), null, null));

        if (filtro == null || "EVENTO".equals(filtro)) eventRepository.findAllByOrderByCreatedAtDesc().forEach(e ->
                agregar(puntos, "EVENTO", e.getId(), e.getTitle(), e.getCategory(), e.getType(), e.getDescription(), e.getLat(), e.getLng(),
                        lat, lng, limite, e.getLocation(), null, null, e.getOwner().getName(), e.getImage(), e.getDate() == null ? null : e.getDate().toString(), e.getTime() == null ? null : e.getTime().toString()));

        if (filtro == null || "REPORTE".equals(filtro)) reportRepository.findAllByOrderByCreatedAtDesc().forEach(r ->
                agregar(puntos, "REPORTE", r.getId(), r.getTitle(), r.getCategory(), r.getPriority(), r.getDescription(), r.getLat(), r.getLng(),
                        lat, lng, limite, r.getLocation(), r.getStatus(), r.getPriority(), r.getOwner().getName(),
                        r.getImages() == null || r.getImages().isEmpty() ? null : r.getImages().get(0), null, null));

        puntos.sort(Comparator.comparingDouble(MapPointResponse::distance));
        return puntos;
    }

    private void agregar(List<MapPointResponse> puntos, String kind, Long id, String title, String category, String type,
                         String description, Double pLat, Double pLng, double lat, double lng, double limite,
                         String location, String status, String priority, String ownerName, String image, String date, String time) {
        if (pLat == null || pLng == null) return;
        double distancia = GeoUtils.distanciaMetros(lat, lng, pLat, pLng);
        if (distancia <= limite) puntos.add(new MapPointResponse(kind, id, title, category, type, description, pLat, pLng, distancia,
                location, status, priority, ownerName, image, date, time));
    }
}
