package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.dto.request.EmergencyRequest;
import com.goeFast.GeoFastPe.dto.response.EmergencyResponse;
import com.goeFast.GeoFastPe.entity.EmergencyReport;
import com.goeFast.GeoFastPe.exception.ApiException;
import com.goeFast.GeoFastPe.repository.EmergencyReportRepository;
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
public class EmergencyService {

    private static final double RADIO_POR_DEFECTO_METROS = 5000;
    private static final int MAXIMO_IMAGENES = 5;

    private final EmergencyReportRepository emergencyRepository;
    private final UserRepository userRepository;

    public EmergencyService(EmergencyReportRepository emergencyRepository, UserRepository userRepository) {
        this.emergencyRepository = emergencyRepository;
        this.userRepository = userRepository;
    }

    /** Si se envian lat y lng, solo devuelve emergencias dentro del radio (metros). */
    public List<EmergencyResponse> listar(Double lat, Double lng, Double radio) {
        Double limite = radio == null ? RADIO_POR_DEFECTO_METROS : radio;
        return emergencyRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(e -> Filtros.dentroDelRadio(lat, lng, limite, e.getLat(), e.getLng()))
                .map(EmergencyResponse::from)
                .toList();
    }

    public EmergencyResponse obtener(Long id) {
        return EmergencyResponse.from(buscar(id));
    }

    public List<EmergencyResponse> misReportes(Long userId) {
        return emergencyRepository.findAllByReporterIdOrderByCreatedAtDesc(userId).stream()
                .map(EmergencyResponse::from)
                .toList();
    }

    @Transactional
    public EmergencyResponse crear(Long userId, EmergencyRequest request) {
        validar(request);
        EmergencyReport emergencia = new EmergencyReport();
        emergencia.setReporter(userRepository.getReferenceById(userId));
        aplicar(emergencia, request);
        return EmergencyResponse.from(emergencyRepository.save(emergencia));
    }

    @Transactional
    public EmergencyResponse cambiarEstado(Long id, String estado) {
        Validaciones.requerirOpcion("estado", estado, Catalogos.EMERGENCIA_ESTADOS);
        EmergencyReport emergencia = buscar(id);
        emergencia.setStatus(estado);
        return EmergencyResponse.from(emergencyRepository.save(emergencia));
    }

    private EmergencyReport buscar(Long id) {
        return emergencyRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "EMERGENCY_NOT_FOUND", "Emergencia no encontrada."));
    }

    private void validar(EmergencyRequest r) {
        Validaciones.requerirOpcion("type", r.type(), Catalogos.EMERGENCIA_TIPOS);
        Validaciones.requerirOpcion("urgency", r.urgency(), Catalogos.URGENCIAS);
        Validaciones.requerirCoordenadas(r.lat(), r.lng());
        Validaciones.requerir(r.images() == null || r.images().size() <= MAXIMO_IMAGENES,
                "Puedes adjuntar como maximo 5 imagenes.");
    }

    private void aplicar(EmergencyReport e, EmergencyRequest r) {
        e.setTitle(r.title().trim());
        e.setType(r.type());
        e.setUrgency(r.urgency());
        e.setDescription(r.description().trim());
        e.setLocationText(Validaciones.texto(r.locationText()));
        e.setLat(r.lat());
        e.setLng(r.lng());
        e.getImages().clear();
        if (r.images() != null) {
            r.images().stream().map(Validaciones::texto).filter(v -> v != null).forEach(e.getImages()::add);
        }
    }
}
