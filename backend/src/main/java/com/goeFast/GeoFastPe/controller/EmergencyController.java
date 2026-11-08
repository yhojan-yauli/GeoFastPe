package com.goeFast.GeoFastPe.controller;

import com.goeFast.GeoFastPe.dto.request.EmergencyRequest;
import com.goeFast.GeoFastPe.dto.request.StatusRequest;
import com.goeFast.GeoFastPe.dto.response.EmergencyResponse;
import com.goeFast.GeoFastPe.security.UserPrincipal;
import com.goeFast.GeoFastPe.service.EmergencyService;
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
@RequestMapping("/api/v1/emergencias")
@Tag(name = "Emergencias (SOS)", description = "Reportes de emergencia. Son un registro; no se notifica a autoridades. Cambiar el estado requiere rol ADMIN.")
public class EmergencyController {

    private final EmergencyService emergencyService;

    public EmergencyController(EmergencyService emergencyService) {
        this.emergencyService = emergencyService;
    }

    @GetMapping
    @Operation(summary = "Listar emergencias", description = "Si envias lat, lng y radio, solo devuelve las emergencias dentro del radio (metros, por defecto 5000).")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Lista de emergencias.")})
    public List<EmergencyResponse> listar(
            @Parameter(description = "Latitud del centro") @RequestParam(required = false) Double lat,
            @Parameter(description = "Longitud del centro") @RequestParam(required = false) Double lng,
            @Parameter(description = "Radio en metros", example = "5000") @RequestParam(required = false) Double radio) {
        return emergencyService.listar(lat, lng, radio);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Ver una emergencia", description = "Detalle de un reporte SOS.")
    @ApiResponses({@ApiResponse(responseCode = "404", description = "Emergencia no encontrada.")})
    public EmergencyResponse obtener(@PathVariable Long id) {
        return emergencyService.obtener(id);
    }

    @GetMapping("/mios")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Mis emergencias", description = "Emergencias reportadas por el usuario autenticado.")
    public List<EmergencyResponse> misReportes(@AuthenticationPrincipal UserPrincipal principal) {
        return emergencyService.misReportes(principal.id());
    }

    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Reportar emergencia",
            description = "Registra una alerta. Envia locationText, o lat y lng. images son URLs de POST /api/v1/archivos (maximo 5).")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Emergencia registrada."),
            @ApiResponse(responseCode = "400", description = "Datos invalidos o sin ubicacion."),
            @ApiResponse(responseCode = "401", description = "Falta el token.")
    })
    public EmergencyResponse crear(@AuthenticationPrincipal UserPrincipal principal,
                                   @Valid @RequestBody EmergencyRequest request) {
        return emergencyService.crear(principal.id(), request);
    }

    @PatchMapping("/{id}/estado")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Cambiar estado (ADMIN)",
            description = "Estados: Registrada, En atención, Atendida o Cerrada. Solo rol ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Estado actualizado."),
            @ApiResponse(responseCode = "403", description = "Requiere rol ADMIN.")
    })
    public EmergencyResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody StatusRequest request) {
        return emergencyService.cambiarEstado(id, request.estado());
    }
}
