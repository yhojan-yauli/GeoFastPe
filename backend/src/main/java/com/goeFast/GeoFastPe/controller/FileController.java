package com.goeFast.GeoFastPe.controller;

import com.goeFast.GeoFastPe.dto.response.FileUploadResponse;
import com.goeFast.GeoFastPe.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/archivos")
@Tag(name = "Archivos", description = "Subida de imagenes (JPG, PNG o WEBP, maximo 5 MB). Primero subes el archivo y usas la url devuelta en image, images o avatar.")
public class FileController {

    private final FileStorageService fileStorageService;

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @SecurityRequirement(name = "bearerAuth")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Subir una imagen",
            description = "Sube una imagen y devuelve su url. Usa esa url en los campos image (servicios, ventas, solidaridad, eventos), images (emergencias y reportes) o avatar (perfil).")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Imagen guardada."),
            @ApiResponse(responseCode = "400", description = "Formato no permitido."),
            @ApiResponse(responseCode = "401", description = "Falta el token."),
            @ApiResponse(responseCode = "413", description = "La imagen supera 5 MB.")
    })
    public FileUploadResponse subir(
            @Schema(description = "Archivo de imagen") @RequestParam("file") MultipartFile file) {
        return fileStorageService.guardar(file);
    }

    @GetMapping("/{nombre}")
    @Operation(summary = "Ver una imagen", description = "Devuelve la imagen guardada. No requiere token para poder mostrarla en la app.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Imagen.",
                    content = @Content(mediaType = "image/*")),
            @ApiResponse(responseCode = "404", description = "Archivo no encontrado.")
    })
    public ResponseEntity<Resource> ver(@PathVariable String nombre) {
        Resource recurso = fileStorageService.cargar(nombre);
        return ResponseEntity.ok()
                .contentType(fileStorageService.tipoDe(nombre))
                .body(recurso);
    }
}
