package com.goeFast.GeoFastPe.controller;

import com.goeFast.GeoFastPe.dto.response.CatalogResponse;
import com.goeFast.GeoFastPe.service.CatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/catalogos")
@Tag(name = "Catalogos", description = "Valores validos para los formularios (categorias, tipos, distritos) y ciudades. Publico.")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    @Operation(summary = "Obtener catalogos",
            description = "Usa estos valores exactos en los campos category, type, condition, urgency, priority, estado, etc.")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Catalogos disponibles.")})
    public CatalogResponse obtener() {
        return catalogService.obtener();
    }
}
