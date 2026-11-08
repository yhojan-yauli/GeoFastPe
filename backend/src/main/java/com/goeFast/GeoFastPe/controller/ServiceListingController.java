package com.goeFast.GeoFastPe.controller;

import com.goeFast.GeoFastPe.dto.request.ServiceRequest;
import com.goeFast.GeoFastPe.dto.response.ServiceResponse;
import com.goeFast.GeoFastPe.security.UserPrincipal;
import com.goeFast.GeoFastPe.service.ServiceListingService;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/servicios")
@Tag(name = "Servicios locales", description = "Servicios que ofrecen los vecinos. Lectura publica; crear, editar y borrar requiere token.")
public class ServiceListingController {

    private final ServiceListingService serviceListingService;

    public ServiceListingController(ServiceListingService serviceListingService) {
        this.serviceListingService = serviceListingService;
    }

    @GetMapping
    @Operation(summary = "Listar servicios",
            description = "Filtra por texto (q), categoria y radio. Si envias lat y lng, solo devuelve los servicios con coordenadas dentro del radio en metros.")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Lista de servicios.")})
    public List<ServiceResponse> listar(
            @Parameter(description = "Texto a buscar en titulo y descripcion") @RequestParam(required = false) String q,
            @Parameter(description = "Hogar, Transporte, Salud, Educación u Otros") @RequestParam(required = false) String categoria,
            @Parameter(description = "Latitud del centro de busqueda") @RequestParam(required = false) Double lat,
            @Parameter(description = "Longitud del centro de busqueda") @RequestParam(required = false) Double lng,
            @Parameter(description = "Radio en metros", example = "1000") @RequestParam(required = false) Double radio) {
        return serviceListingService.listar(q, categoria, lat, lng, radio);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Ver un servicio", description = "Devuelve el detalle de un servicio.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Servicio encontrado."),
            @ApiResponse(responseCode = "404", description = "Servicio no encontrado.")
    })
    public ServiceResponse obtener(@PathVariable Long id) {
        return serviceListingService.obtener(id);
    }

    @GetMapping("/mios")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Mis servicios", description = "Servicios publicados por el usuario autenticado.")
    @ApiResponses({@ApiResponse(responseCode = "401", description = "Falta el token.")})
    public List<ServiceResponse> misServicios(@AuthenticationPrincipal UserPrincipal principal) {
        return serviceListingService.misServicios(principal.id());
    }

    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Publicar un servicio",
            description = "Crea un servicio. Para ubicacion GPS envia latitude y longitude; para direccion envia address.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Servicio creado."),
            @ApiResponse(responseCode = "400", description = "Datos invalidos."),
            @ApiResponse(responseCode = "401", description = "Falta el token.")
    })
    public ServiceResponse crear(@AuthenticationPrincipal UserPrincipal principal,
                                 @Valid @RequestBody ServiceRequest request) {
        return serviceListingService.crear(principal.id(), request);
    }

    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Editar un servicio", description = "Reemplaza los datos del servicio. Solo el creador puede editarlo.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Servicio actualizado."),
            @ApiResponse(responseCode = "403", description = "No eres el creador."),
            @ApiResponse(responseCode = "404", description = "Servicio no encontrado.")
    })
    public ServiceResponse actualizar(@AuthenticationPrincipal UserPrincipal principal,
                                      @PathVariable Long id,
                                      @Valid @RequestBody ServiceRequest request) {
        return serviceListingService.actualizar(id, principal.id(), request);
    }

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar un servicio", description = "Borra el servicio. Solo el creador puede eliminarlo.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Servicio eliminado."),
            @ApiResponse(responseCode = "403", description = "No eres el creador.")
    })
    public void eliminar(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        serviceListingService.eliminar(id, principal.id());
    }
}
