package com.goeFast.GeoFastPe.controller;

import com.goeFast.GeoFastPe.dto.request.EventRequest;
import com.goeFast.GeoFastPe.dto.response.EventResponse;
import com.goeFast.GeoFastPe.security.UserPrincipal;
import com.goeFast.GeoFastPe.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/eventos")
@Tag(name = "Eventos comunitarios", description = "Actividades de la comunidad y asistencia. Lectura publica; crear, editar, borrar y participar requiere token.")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    @Operation(summary = "Listar eventos",
            description = "tab: proximos (por defecto), finalizados o mios (requiere token). orden: recent (por defecto), soon o popular.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de eventos."),
            @ApiResponse(responseCode = "401", description = "tab=mios requiere token.")
    })
    public List<EventResponse> listar(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "proximos, finalizados o mios") @RequestParam(required = false) String tab,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String q,
            @Parameter(description = "recent, soon o popular") @RequestParam(required = false) String orden) {
        return eventService.listar(tab, categoria, q, orden, principal == null ? null : principal.id());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Ver un evento", description = "Detalle del evento con participantes y si asistes (joined).")
    @ApiResponses({@ApiResponse(responseCode = "404", description = "Evento no encontrado.")})
    public EventResponse obtener(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return eventService.obtener(id, principal == null ? null : principal.id());
    }

    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear evento", description = "La fecha (yyyy-MM-dd) y hora (HH:mm) deben ser futuras (zona America/Lima).")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Evento creado."),
            @ApiResponse(responseCode = "400", description = "Datos invalidos o fecha pasada."),
            @ApiResponse(responseCode = "401", description = "Falta el token.")
    })
    public EventResponse crear(@AuthenticationPrincipal UserPrincipal principal,
                               @Valid @RequestBody EventRequest request) {
        return eventService.crear(principal.id(), request);
    }

    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Editar evento", description = "Solo el creador puede editarlo.")
    @ApiResponses({@ApiResponse(responseCode = "403", description = "No eres el creador.")})
    public EventResponse actualizar(@AuthenticationPrincipal UserPrincipal principal,
                                    @PathVariable Long id,
                                    @Valid @RequestBody EventRequest request) {
        return eventService.actualizar(id, principal.id(), request);
    }

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar evento", description = "Solo el creador puede eliminarlo. Tambien borra las asistencias.")
    @ApiResponses({@ApiResponse(responseCode = "204", description = "Evento eliminado.")})
    public void eliminar(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        eventService.eliminar(id, principal.id());
    }

    @PostMapping("/{id}/participar")
    @SecurityRequirement(name = "bearerAuth")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Participar en el evento", description = "Registra tu asistencia. Es idempotente.")
    @ApiResponses({@ApiResponse(responseCode = "204", description = "Asistencia registrada.")})
    public void participar(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        eventService.participar(id, principal.id());
    }

    @DeleteMapping("/{id}/participar")
    @SecurityRequirement(name = "bearerAuth")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Dejar de participar", description = "Quita tu asistencia al evento.")
    @ApiResponses({@ApiResponse(responseCode = "204", description = "Asistencia cancelada.")})
    public void dejarDeParticipar(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        eventService.dejarDeParticipar(id, principal.id());
    }
}
