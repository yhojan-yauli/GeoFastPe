
import type { MapCity, MapLocation } from "../types/map.types";

export const CITIES: Record<string, MapCity> = {
  lima: {
    name: "Lima",
    lat: -12.046374,
    lng: -77.042793,
    zoom: 14,
  },
  arequipa: {
    name: "Arequipa",
    lat: -16.409047,
    lng: -71.537451,
    zoom: 14,
  },
  cusco: {
    name: "Cusco",
    lat: -13.531950,
    lng: -71.967463,
    zoom: 14,
  },
};

// Datos ficticios para probar la interfaz.
// No representan establecimientos reales.
export const DEMO_LOCATIONS: MapLocation[] = [
  {
    id: 1,
    name: "Servicio de gasfitería",
    category: "Servicio",
    description: "Ejemplo de servicio comunitario.",
    lat: -12.046,
    lng: -77.043,
  },
  {
    id: 2,
    name: "Apoyo vecinal",
    category: "Solidaridad",
    description: "Ejemplo de iniciativa solidaria.",
    lat: -12.049,
    lng: -77.04,
  },
  {
    id: 3,
    name: "Alerta comunitaria",
    category: "Emergencia",
    description: "Ejemplo de reporte de emergencia.",
    lat: -12.044,
    lng: -77.046,
  },
];
