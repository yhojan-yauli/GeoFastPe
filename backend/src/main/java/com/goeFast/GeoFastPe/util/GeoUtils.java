package com.goeFast.GeoFastPe.util;

public final class GeoUtils {

    private static final double EARTH_RADIUS_METERS = 6371e3;

    private GeoUtils() {
    }

    /** Distancia en metros entre dos puntos (formula de Haversine). */
    public static double distanciaMetros(double lat1, double lng1, double lat2, double lng2) {
        double p1 = Math.toRadians(lat1);
        double p2 = Math.toRadians(lat2);
        double dp = Math.toRadians(lat2 - lat1);
        double dl = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dp / 2) * Math.sin(dp / 2)
                + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
        return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
