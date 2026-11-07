
import { useMemo, useState } from "react";
import MapView from "./MapView";
import MapInfoPanel from "./MapInfoPanel";
import { CITIES, DEMO_LOCATIONS } from "../data/mapConfig";
import type { MapLocation } from "../types/map.types";

function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) *
      Math.cos(lat2 * rad) *
      Math.sin(dLng / 2) ** 2;

  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function MapSection() {
  const [city, setCity] = useState("lima");
  const [radius, setRadius] = useState(1000);
  const [selected, setSelected] = useState<MapLocation | null>(null);

  const currentCity = CITIES[city];
  const center: [number, number] = useMemo(
    () => [currentCity.lng, currentCity.lat],
    [currentCity.lng, currentCity.lat]
  );

  const visibleLocations = useMemo(
    () =>
      DEMO_LOCATIONS.filter(
        (location) =>
          distanceMeters(
            currentCity.lat,
            currentCity.lng,
            location.lat,
            location.lng
          ) <= radius
      ),
    [currentCity.lat, currentCity.lng, radius]
  );

  const changeCity = (nextCity: string) => {
    setCity(nextCity);
    setSelected(null);
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Mapa Vecinal
        </h2>
        <p className="text-sm text-slate-500">
          Explora servicios y actividades de tu comunidad.
        </p>
      </div>

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
          onRadiusChange={setRadius}
        />
      </div>
    </section>
  );
}
