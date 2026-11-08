package com.goeFast.GeoFastPe.controller;

import com.goeFast.GeoFastPe.dto.request.SaleRequest;
import com.goeFast.GeoFastPe.dto.response.ConversationResponse;
import com.goeFast.GeoFastPe.dto.response.SaleResponse;
import com.goeFast.GeoFastPe.security.UserPrincipal;
import com.goeFast.GeoFastPe.service.SaleService;
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
@RequestMapping("/api/v1/ventas")
@Tag(name = "Ventas locales", description = "Productos en venta de la comunidad. Lectura publica; crear, editar y borrar requiere token.")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @GetMapping
    @Operation(summary = "Listar ventas", description = "Filtra por texto, categoria, condicion y distrito. orden: recientes, precio_asc o precio_desc.")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Lista de productos.")})
    public List<SaleResponse> listar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String condicion,
            @RequestParam(required = false) String distrito,
            @Parameter(description = "recientes, precio_asc o precio_desc") @RequestParam(required = false) String orden) {
        return saleService.listar(q, categoria, condicion, distrito, orden);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Ver un producto", description = "Detalle de un producto en venta.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Producto encontrado."),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado.")
    })
    public SaleResponse obtener(@PathVariable Long id) {
        return saleService.obtener(id);
    }

    @GetMapping("/mios")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Mis ventas", description = "Productos publicados por el usuario autenticado.")
    public List<SaleResponse> misVentas(@AuthenticationPrincipal UserPrincipal principal) {
        return saleService.misVentas(principal.id());
    }

    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Publicar un producto", description = "Crea una venta. image es la URL devuelta por POST /api/v1/archivos.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Producto publicado."),
            @ApiResponse(responseCode = "400", description = "Datos invalidos."),
            @ApiResponse(responseCode = "401", description = "Falta el token.")
    })
    public SaleResponse crear(@AuthenticationPrincipal UserPrincipal principal,
                              @Valid @RequestBody SaleRequest request) {
        return saleService.crear(principal.id(), request);
    }

    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Editar un producto", description = "Solo el creador puede editarlo. status puede ser Disponible o Vendido.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Producto actualizado."),
            @ApiResponse(responseCode = "403", description = "No eres el creador.")
    })
    public SaleResponse actualizar(@AuthenticationPrincipal UserPrincipal principal,
                                   @PathVariable Long id,
                                   @Valid @RequestBody SaleRequest request) {
        return saleService.actualizar(id, principal.id(), request);
    }

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar un producto", description = "Solo el creador puede eliminarlo.")
    @ApiResponses({@ApiResponse(responseCode = "204", description = "Producto eliminado.")})
    public void eliminar(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        saleService.eliminar(id, principal.id());
    }

    @PostMapping("/{id}/contactar")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Contactar al vendedor",
            description = "Abre (o reutiliza) una conversacion en Mensajes con el vendedor de este producto.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Conversacion creada o existente."),
            @ApiResponse(responseCode = "400", description = "No puedes contactar tu propia venta.")
    })
    public ConversationResponse contactar(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return saleService.contactarVendedor(id, principal.id());
    }
}
