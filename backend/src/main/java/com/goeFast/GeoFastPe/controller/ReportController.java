package com.goeFast.GeoFastPe.controller;

import com.goeFast.GeoFastPe.dto.request.ReportRequest;
import com.goeFast.GeoFastPe.dto.request.StatusRequest;
import com.goeFast.GeoFastPe.dto.response.ReportResponse;
import com.goeFast.GeoFastPe.security.UserPrincipal;
import com.goeFast.GeoFastPe.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reportes")
@Tag(name = "Reportes comunitarios", description = "Incidencias de la comunidad (baches, luminarias, basura). Lectura publica; crear requiere token; cambiar estado requiere ADMIN.")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    @Operation(summary = "Listar reportes", description = "Filtra por texto, categoria y estado (Pendiente, En proceso, En revisión o Resuelto).")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Lista de reportes.")})
    public List<ReportResponse> listar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String categoria,
            @Parameter(description = "Pendiente, En proceso, En revisión o Resuelto") @RequestParam(required = false) String estado) {
        return reportService.listar(q, categoria, estado);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Ver un reporte", description = "Detalle de un reporte.")
    @ApiResponses({@ApiResponse(responseCode = "404", description = "Reporte no encontrado.")})
    public ReportResponse obtener(@PathVariable Long id) {
        return reportService.obtener(id);
    }

    @GetMapping("/mios")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Mis reportes", description = "Reportes creados por el usuario autenticado.")
    public List<ReportResponse> misReportes(@AuthenticationPrincipal UserPrincipal principal) {
        return reportService.misReportes(principal.id());
    }

    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear reporte",
            description = "Envia location, o lat y lng. images son URLs de POST /api/v1/archivos (maximo 5). El estado inicial es Pendiente.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Reporte creado."),
            @ApiResponse(responseCode = "400", description = "Datos invalidos o sin ubicacion."),
            @ApiResponse(responseCode = "401", description = "Falta el token.")
    })
    public ReportResponse crear(@AuthenticationPrincipal UserPrincipal principal,
                                @Valid @RequestBody ReportRequest request) {
        return reportService.crear(principal.id(), request);
    }

    @PatchMapping("/{id}/estado")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Cambiar estado (ADMIN)",
            description = "Estados: Pendiente, En proceso, En revisión o Resuelto. Solo rol ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Estado actualizado."),
            @ApiResponse(responseCode = "403", description = "Requiere rol ADMIN.")
    })
    public ReportResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody StatusRequest request) {
        return reportService.cambiarEstado(id, request.estado());
    }
}
