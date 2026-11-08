package com.goeFast.GeoFastPe.util;

import java.util.Locale;

public final class Filtros {

    private static final double RADIO_POR_DEFECTO_METROS = 1000;

    private Filtros() {
    }

    /** Verdadero si el texto buscado aparece (sin distinguir mayusculas) en alguno de los campos. */
    public static boolean coincide(String busqueda, String... campos) {
        if (busqueda == null || busqueda.isBlank()) {
            return true;
        }
        String buscado = busqueda.trim().toLowerCase(Locale.ROOT);
        for (String campo : campos) {
            if (campo != null && campo.toLowerCase(Locale.ROOT).contains(buscado)) {
                return true;
            }
        }
        return false;
    }

    public static boolean igualOpcional(String filtro, String valor) {
        return filtro == null || filtro.isBlank() || filtro.equals(valor);
    }

    /** Sin coordenadas de referencia no se filtra; sin coordenadas del punto no entra en el radio. */
    public static boolean dentroDelRadio(Double lat, Double lng, Double radio, Double pLat, Double pLng) {
        if (lat == null || lng == null) {
            return true;
        }
        if (pLat == null || pLng == null) {
            return false;
        }
        double limite = radio == null ? RADIO_POR_DEFECTO_METROS : radio;
        return GeoUtils.distanciaMetros(lat, lng, pLat, pLng) <= limite;
    }
}
