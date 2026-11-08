package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.config.StorageProperties;
import com.goeFast.GeoFastPe.dto.response.FileUploadResponse;
import com.goeFast.GeoFastPe.exception.ApiException;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class FileStorageService {

    private static final Map<String, String> EXTENSIONES = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp"
    );

    private static final Pattern NOMBRE_VALIDO = Pattern.compile("^[a-f0-9-]{36}\\.(jpg|png|webp)$");

    private final Path directorio;
    private final long maxBytes;

    public FileStorageService(StorageProperties properties) {
        this.directorio = Path.of(properties.uploadDir()).toAbsolutePath().normalize();
        this.maxBytes = properties.maxFileSizeBytes();
        try {
            Files.createDirectories(directorio);
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo crear la carpeta de archivos: " + directorio, ex);
        }
    }

    public FileUploadResponse guardar(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Debes enviar un archivo.");
        }

        String tipo = archivo.getContentType();
        String extension = tipo == null ? null : EXTENSIONES.get(tipo);
        if (extension == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR",
                    "Solo se permiten imagenes JPG, PNG o WEBP.");
        }

        if (archivo.getSize() > maxBytes) {
            throw new ApiException(HttpStatus.CONTENT_TOO_LARGE, "FILE_TOO_LARGE",
                    "La imagen no debe superar 5 MB.");
        }

        String nombre = UUID.randomUUID() + "." + extension;
        try {
            Files.copy(archivo.getInputStream(), directorio.resolve(nombre), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "FILE_STORAGE_ERROR",
                    "No se pudo guardar el archivo.");
        }

        return new FileUploadResponse("/api/v1/archivos/" + nombre, tipo, archivo.getSize());
    }

    public Resource cargar(String nombre) {
        if (!NOMBRE_VALIDO.matcher(nombre).matches()) {
            throw noEncontrado();
        }
        Path ruta = directorio.resolve(nombre).normalize();
        if (!ruta.startsWith(directorio) || !Files.exists(ruta)) {
            throw noEncontrado();
        }
        return new FileSystemResource(ruta);
    }

    public MediaType tipoDe(String nombre) {
        if (nombre.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        }
        if (nombre.endsWith(".webp")) {
            return MediaType.parseMediaType("image/webp");
        }
        return MediaType.IMAGE_JPEG;
    }

    private ApiException noEncontrado() {
        return new ApiException(HttpStatus.NOT_FOUND, "FILE_NOT_FOUND", "Archivo no encontrado.");
    }
}

