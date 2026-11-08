package com.goeFast.GeoFastPe.util;

import com.goeFast.GeoFastPe.exception.ApiException;
import org.springframework.http.HttpStatus;

import java.util.List;

public final class Validaciones {

    private Validaciones() {
    }

    public static void requerirOpcion(String campo, String valor, List<String> permitidos) {
        if (valor == null || !permitidos.contains(valor)) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "VALIDATION_ERROR",
                    "El campo '" + campo + "' debe ser uno de: " + String.join(", ", permitidos)
            );
        }
    }

    public static void opcionOpcional(String campo, String valor, List<String> permitidos) {
        if (valor != null) {
            requerirOpcion(campo, valor, permitidos);
        }
    }

    public static String texto(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return valor.trim();
    }

    public static void requerirCoordenadas(Double lat, Double lng) {
        if (lat == null && lng == null) return;
        if (lat == null || lng == null || !Double.isFinite(lat) || !Double.isFinite(lng)
                || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Coordenadas fuera de rango.");
        }
    }

    public static void requerirRadio(Double radio) {
        requerir(radio == null || (Double.isFinite(radio) && radio > 0 && radio <= 50000),
                "El radio debe ser finito, mayor que cero y no superar 50000 metros.");
    }

    public static void requerir(boolean condicion, String mensaje) {
        if (!condicion) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", mensaje);
        }
    }

    public static void requerirPropietario(boolean esPropietario) {
        if (!esPropietario) {
            throw new ApiException(HttpStatus.FORBIDDEN, "NOT_OWNER", "Solo el creador puede modificar esta publicacion.");
        }
    }
}
