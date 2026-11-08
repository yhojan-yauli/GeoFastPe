package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.dto.request.ServiceRequest;
import com.goeFast.GeoFastPe.dto.response.ServiceResponse;
import com.goeFast.GeoFastPe.entity.ServiceListing;
import com.goeFast.GeoFastPe.exception.ApiException;
import com.goeFast.GeoFastPe.repository.ServiceListingRepository;
import com.goeFast.GeoFastPe.repository.UserRepository;
import com.goeFast.GeoFastPe.util.Catalogos;
import com.goeFast.GeoFastPe.util.Filtros;
import com.goeFast.GeoFastPe.util.Validaciones;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ServiceListingService {

    private final ServiceListingRepository serviceRepository;
    private final UserRepository userRepository;
    private final GeoService geoService;
    private final com.goeFast.GeoFastPe.repository.RecomendacionServicioRepository recomendaciones;

    public ServiceListingService(ServiceListingRepository serviceRepository, UserRepository userRepository, GeoService geoService, com.goeFast.GeoFastPe.repository.RecomendacionServicioRepository recomendaciones) {
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
        this.geoService = geoService;
        this.recomendaciones = recomendaciones;
    }

    public List<ServiceResponse> listar(String q, String categoria, Double lat, Double lng, Double radio) {
        Validaciones.requerirCoordenadas(lat, lng);
        Validaciones.requerirRadio(radio);
        return serviceRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(s -> Filtros.coincide(q, s.getTitle(), s.getDescription()))
                .filter(s -> Filtros.igualOpcional(categoria, s.getCategory()))
                .filter(s -> Filtros.dentroDelRadio(lat, lng, radio, s.getLatitude(), s.getLongitude()))
                .map(ServiceResponse::from)
                .toList();
    }

    public ServiceResponse obtener(Long id) {
        return ServiceResponse.from(buscar(id));
    }

    public List<ServiceResponse> misServicios(Long userId) {
        return serviceRepository.findAllByOwnerIdOrderByCreatedAtDesc(userId).stream()
                .map(ServiceResponse::from)
                .toList();
    }

    @Transactional
    public ServiceResponse crear(Long userId, ServiceRequest request) {
        validar(request);
        ServiceListing servicio = new ServiceListing();
        servicio.setOwner(userRepository.getReferenceById(userId));
        aplicar(servicio, request);
        return ServiceResponse.from(serviceRepository.save(servicio));
    }

    @Transactional
    public ServiceResponse actualizar(Long id, Long userId, ServiceRequest request) {
        validar(request);
        ServiceListing servicio = serviceRepository.findForUpdate(id).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "SERVICE_NOT_FOUND", "Servicio no encontrado."));
        Validaciones.requerirPropietario(servicio.getOwner().getId().equals(userId));
        aplicar(servicio, request);
        return ServiceResponse.from(serviceRepository.save(servicio));
    }

    @Transactional
    public void eliminar(Long id, Long userId) {
        ServiceListing servicio = serviceRepository.findForUpdate(id).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "SERVICE_NOT_FOUND", "Servicio no encontrado."));
        Validaciones.requerirPropietario(servicio.getOwner().getId().equals(userId));
        recomendaciones.deleteAllByServicioId(id);
        serviceRepository.delete(servicio);
    }

    private ServiceListing buscar(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SERVICE_NOT_FOUND", "Servicio no encontrado."));
    }

    private void validar(ServiceRequest r) {
        Validaciones.requerirOpcion("category", r.category(), Catalogos.SERVICIO_CATEGORIAS);
        Validaciones.requerirOpcion("type", r.type(), Catalogos.SERVICIO_TIPOS);
        Validaciones.requerirOpcion("locationType", r.locationType(), Catalogos.SERVICIO_UBICACION);
        Validaciones.requerirOpcion("availability", r.availability(), Catalogos.SERVICIO_DISPONIBILIDAD);
        if ("gps".equals(r.locationType())) {
            Validaciones.requerir(r.latitude() != null && r.longitude() != null,
                    "Para ubicacion GPS debes enviar latitude y longitude.");
        } else {
            Validaciones.requerir(Validaciones.texto(r.address()) != null,
                    "Para ubicacion por direccion debes enviar address.");
        }
        Validaciones.requerirCoordenadas(r.latitude(), r.longitude());
    }

    private void aplicar(ServiceListing servicio, ServiceRequest r) {
        servicio.setTitle(r.title().trim());
        servicio.setCategory(r.category());
        servicio.setType(r.type());
        servicio.setDescription(r.description().trim());
        servicio.setPhone(r.phone());
        servicio.setLocationType(r.locationType());
        servicio.setAddress(Validaciones.texto(r.address()));
        Double lat = r.latitude(), lng = r.longitude();
        if (lat == null && lng == null) {
            var lugares = geoService.buscarLugar(r.address(), null, null);
            if (lugares.isEmpty()) throw new ApiException(HttpStatus.valueOf(422),
                    "ADDRESS_NOT_FOUND", "No se encontro la direccion; proporciona un punto preciso.");
            if (lugares.size() > 1) throw new ApiException(HttpStatus.valueOf(422),
                    "ADDRESS_AMBIGUOUS", "Hay varias coincidencias; proporciona coordenadas para confirmar el lugar.");
            lat = lugares.getFirst().lat();
            lng = lugares.getFirst().lng();
        }
        Validaciones.requerirCoordenadas(lat, lng);
        servicio.setLatitude(lat);
        servicio.setLongitude(lng);
        servicio.setAvailability(r.availability());
        servicio.setImage(Validaciones.texto(r.image()));
    }
}
