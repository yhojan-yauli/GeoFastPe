package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.dto.request.ReportRequest;
import com.goeFast.GeoFastPe.dto.response.ReportResponse;
import com.goeFast.GeoFastPe.entity.CitizenReport;
import com.goeFast.GeoFastPe.exception.ApiException;
import com.goeFast.GeoFastPe.repository.CitizenReportRepository;
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
public class ReportService {

    private static final int MAXIMO_IMAGENES = 5;

    private final CitizenReportRepository reportRepository;
    private final UserRepository userRepository;

    public ReportService(CitizenReportRepository reportRepository, UserRepository userRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
    }

    public List<ReportResponse> listar(String q, String categoria, String estado) {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(r -> Filtros.coincide(q, r.getTitle(), r.getDescription(), r.getLocation()))
                .filter(r -> Filtros.igualOpcional(categoria, r.getCategory()))
                .filter(r -> Filtros.igualOpcional(estado, r.getStatus()))
                .map(ReportResponse::from)
                .toList();
    }

    public ReportResponse obtener(Long id) {
        return ReportResponse.from(buscar(id));
    }

    public List<ReportResponse> misReportes(Long userId) {
        return reportRepository.findAllByOwnerIdOrderByCreatedAtDesc(userId).stream()
                .map(ReportResponse::from)
                .toList();
    }

    @Transactional
    public ReportResponse crear(Long userId, ReportRequest request) {
        validar(request);
        CitizenReport reporte = new CitizenReport();
        reporte.setOwner(userRepository.getReferenceById(userId));
        aplicar(reporte, request);
        return ReportResponse.from(reportRepository.save(reporte));
    }

    @Transactional
    public ReportResponse cambiarEstado(Long id, String estado) {
        Validaciones.requerirOpcion("estado", estado, Catalogos.REPORTE_ESTADOS);
        CitizenReport reporte = buscar(id);
        reporte.setStatus(estado);
        return ReportResponse.from(reportRepository.save(reporte));
    }

    private CitizenReport buscar(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "REPORT_NOT_FOUND", "Reporte no encontrado."));
    }

    private void validar(ReportRequest r) {
        Validaciones.requerirOpcion("category", r.category(), Catalogos.REPORTE_CATEGORIAS);
        Validaciones.requerirOpcion("priority", r.priority(), Catalogos.PRIORIDADES);
        Validaciones.requerir(Validaciones.texto(r.location()) != null || (r.lat() != null && r.lng() != null),
                "Indica la ubicacion con location, o con lat y lng.");
        Validaciones.requerirCoordenadas(r.lat(), r.lng());
        Validaciones.requerir(r.images() == null || r.images().size() <= MAXIMO_IMAGENES,
                "Puedes adjuntar como maximo 5 imagenes.");
    }

    private void aplicar(CitizenReport c, ReportRequest r) {
        c.setTitle(r.title().trim());
        c.setCategory(r.category());
        c.setPriority(r.priority());
        c.setDescription(r.description().trim());
        c.setLocation(Validaciones.texto(r.location()));
        c.setLat(r.lat());
        c.setLng(r.lng());
        c.getImages().clear();
        if (r.images() != null) {
            r.images().stream().map(Validaciones::texto).filter(v -> v != null).forEach(c.getImages()::add);
        }
    }
}
