import { useMemo, useState } from "react";

import MapView from "./MapView";
import MapInfoPanel from "./MapInfoPanel";

import { CITIES, DEMO_LOCATIONS } from "../data/mapConfig";

import type { MapLocation } from "../types/map.types";
import type { Servicio } from "../../services/ServicesPage";

interface MapSectionProps {
  servicios?: Servicio[];
}

function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) *
      Math.cos(lat2 * rad) *
      Math.sin(dLng / 2) ** 2;

  return (
    6371000 *
    2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

export default function MapSection({
  servicios = [],
}: MapSectionProps) {
  // Configuración del mapa
  const [city, setCity] = useState("arequipa");
  const [radius, setRadius] = useState(1000);

  // Ubicación seleccionada
  const [selected, setSelected] =
    useState<MapLocation | null>(null);

  // Ciudad actual
  const currentCity = CITIES[city];

  // Centro del mapa
  const center: [number, number] = useMemo(
    () => [currentCity.lng, currentCity.lat],
    [currentCity.lng, currentCity.lat]
  );

  // Convertir servicios publicados en marcadores
  const publishedLocations = useMemo<MapLocation[]>(
    () =>
      servicios
        .filter(
          (servicio) =>
            typeof servicio.lat === "number" &&
            typeof servicio.lng === "number" &&
            Number.isFinite(servicio.lat) &&
            Number.isFinite(servicio.lng)
        )

            .map((servicio) => ({
              id: servicio.id,
              name: servicio.nombre,
              category: "Servicio" as const,
              description:
                servicio.descripcion ??
                "Servicio disponible en la comunidad.",
              lat: servicio.lat!,
              lng: servicio.lng!,
            })),

    [servicios]
  );

  // Unificar marcadores de demostración y servicios
  const allLocations = useMemo<MapLocation[]>(
    () => [
      ...DEMO_LOCATIONS,
      ...publishedLocations,
    ],
    [publishedLocations]
  );

  // Filtrar ubicaciones según ciudad y radio
  const visibleLocations = useMemo(
    () =>
      allLocations.filter(
        (location) =>
          distanceMeters(
            currentCity.lat,
            currentCity.lng,
            location.lat,
            location.lng
          ) <= radius
      ),
    [
      allLocations,
      currentCity.lat,
      currentCity.lng,
      radius,
    ]
  );

  // Cambiar ciudad
  const changeCity = (nextCity: string) => {
    if (!CITIES[nextCity]) return;

    setCity(nextCity);
    setSelected(null);
  };

  // Cambiar radio
  const changeRadius = (nextRadius: number) => {
    setRadius(nextRadius);
    setSelected(null);
  };

  return (
    <section className="space-y-4">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Mapa Vecinal
        </h2>

        <p className="text-sm text-slate-500">
          Explora servicios, iniciativas solidarias y
          actividades de tu comunidad.
        </p>
      </div>

      {/* Mapa y panel informativo */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <MapView
            center={center}
            radius={radius}
            locations={visibleLocations}
            onSelectLocation={setSelected}
          />
        </div>

        <MapInfoPanel
          selected={selected}
          city={city}
          radius={radius}
          onCityChange={changeCity}
          onRadiusChange={changeRadius}
        />
      </div>
    </section>
  );
}
