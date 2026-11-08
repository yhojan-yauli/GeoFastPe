package com.goeFast.GeoFastPe.util;

import java.util.List;

public final class Catalogos {

    public static final List<String> SERVICIO_CATEGORIAS = List.of("Hogar", "Transporte", "Salud", "Educación", "Otros");
    public static final List<String> SERVICIO_TIPOS = List.of("Servicio a domicilio", "Servicio en local", "Servicio virtual", "Servicio mixto");
    public static final List<String> SERVICIO_UBICACION = List.of("gps", "address");
    public static final List<String> SERVICIO_DISPONIBILIDAD = List.of("weekdays", "weekends", "everyday", "appointment");

    public static final List<String> VENTA_CATEGORIAS = List.of("Tecnología", "Hogar", "Moda", "Deportes", "Vehículos", "Libros", "Otros");
    public static final List<String> VENTA_CONDICIONES = List.of("Nuevo", "Usado");
    public static final List<String> VENTA_ESTADOS = List.of("Disponible", "Vendido");
    public static final List<String> DISTRITOS = List.of("Cercado", "Cayma", "Yanahuara", "Cerro Colorado", "Paucarpata",
            "José Luis Bustamante y Rivero", "Miraflores", "Mariano Melgar", "Sachaca", "Socabaya", "Hunter",
            "Alto Selva Alegre", "Tiabaya", "Uchumayo", "Otro");

    public static final List<String> SOLIDARIDAD_TIPOS = List.of("DONACION", "SOLICITUD");
    public static final List<String> SOLIDARIDAD_CATEGORIAS = List.of("Alimentos", "Ropa", "Útiles", "Salud", "Otros");
    public static final List<String> DONACION_CONDICIONES = List.of("Nuevo", "Buen estado", "Usado");
    public static final List<String> SOLIDARIDAD_ESTADOS = List.of("Disponible", "Cerrada");
    public static final List<String> URGENCIAS = List.of("Alta", "Media", "Baja");

    public static final List<String> EMERGENCIA_TIPOS = List.of("Salud", "Incendio", "Riesgo en la vía", "Seguridad", "Desastre natural", "Otra");
    public static final List<String> EMERGENCIA_ESTADOS = List.of("Registrada", "En atención", "Atendida", "Cerrada");

    public static final List<String> REPORTE_CATEGORIAS = List.of("Infraestructura", "Seguridad", "Servicios", "Otro");
    public static final List<String> PRIORIDADES = List.of("Alta", "Media", "Baja");
    public static final List<String> REPORTE_ESTADOS = List.of("Pendiente", "En proceso", "En revisión", "Resuelto");

    public static final List<String> EVENTO_CATEGORIAS = List.of("Cultura", "Deporte", "Educación", "Salud", "Ambiente", "Otros");
    public static final List<String> EVENTO_TIPOS = List.of("Presencial", "Virtual", "Híbrido");

    public static final List<String> CHAT_CATEGORIAS = List.of("Vecinos", "Servicios", "Eventos", "Grupos", "Ventas");

    private Catalogos() {
    }
}
