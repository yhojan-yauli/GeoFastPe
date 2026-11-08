package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.dto.response.CatalogResponse;
import com.goeFast.GeoFastPe.dto.response.CatalogResponse.Ciudad;
import com.goeFast.GeoFastPe.dto.response.CatalogResponse.Emergencias;
import com.goeFast.GeoFastPe.dto.response.CatalogResponse.Eventos;
import com.goeFast.GeoFastPe.dto.response.CatalogResponse.Reportes;
import com.goeFast.GeoFastPe.dto.response.CatalogResponse.Servicios;
import com.goeFast.GeoFastPe.dto.response.CatalogResponse.Solidaridad;
import com.goeFast.GeoFastPe.dto.response.CatalogResponse.Ventas;
import com.goeFast.GeoFastPe.util.Catalogos;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CatalogService {

    public CatalogResponse obtener() {
        return new CatalogResponse(
                new Servicios(Catalogos.SERVICIO_CATEGORIAS, Catalogos.SERVICIO_TIPOS,
                        Catalogos.SERVICIO_UBICACION, Catalogos.SERVICIO_DISPONIBILIDAD),
                new Ventas(Catalogos.VENTA_CATEGORIAS, Catalogos.VENTA_CONDICIONES,
                        Catalogos.VENTA_ESTADOS, Catalogos.DISTRITOS),
                new Solidaridad(Catalogos.SOLIDARIDAD_TIPOS, Catalogos.SOLIDARIDAD_CATEGORIAS,
                        Catalogos.DONACION_CONDICIONES, Catalogos.URGENCIAS, Catalogos.SOLIDARIDAD_ESTADOS),
                new Emergencias(Catalogos.EMERGENCIA_TIPOS, Catalogos.URGENCIAS, Catalogos.EMERGENCIA_ESTADOS),
                new Reportes(Catalogos.REPORTE_CATEGORIAS, Catalogos.PRIORIDADES, Catalogos.REPORTE_ESTADOS),
                new Eventos(Catalogos.EVENTO_CATEGORIAS, Catalogos.EVENTO_TIPOS),
                Catalogos.CHAT_CATEGORIAS,
                List.of(
                        new Ciudad("lima", "Lima", -12.046374, -77.042793, 14),
                        new Ciudad("arequipa", "Arequipa", -16.409047, -71.537451, 14),
                        new Ciudad("cusco", "Cusco", -13.531950, -71.967463, 14)
                )
        );
    }
}
