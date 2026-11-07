
import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { MapPin, LocateFixed, LoaderCircle } from "lucide-react";
import "leaflet/dist/leaflet.css";

export interface ServiceLocation {
  lat: number;
  lng: number;
  address: string;
}

interface Props {
  value: ServiceLocation | null;
  onChange: (location: ServiceLocation) => void;
}

const AREQUIPA: LatLngExpression = [-16.3989, -71.535];

const markerIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:22px;
      height:22px;
      background:#6d28d9;
      border:4px solid white;
      border-radius:50%;
      box-shadow:0 2px 12px #6d28d988;
    "></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

function MapClickHandler({
  onSelect
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    }
  });

  return null;
}

function MapRecenter({
  position
}: {
  position: ServiceLocation | null;
}) {
  const map = useMap();

  const lat = position?.lat;
  const lng = position?.lng;

  // Recentrar solamente cuando cambien las coordenadas.
  const [previous, setPrevious] = useState("");

  const current =
    lat !== undefined && lng !== undefined
      ? `${lat},${lng}`
      : "";

  if (current && current !== previous) {
    setPrevious(current);
    map.setView([lat!, lng!], 16);
  }

  return null;
}

export default function ServiceLocationPicker({
  value,
  onChange
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectPoint = (lat: number, lng: number) => {
    onChange({
      lat,
      lng,
      address: value?.address || ""
    });
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Tu navegador no admite geolocalización.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        selectPoint(
          position.coords.latitude,
          position.coords.longitude
        );
        setLoading(false);
      },
      () => {
        setError(
          "No se pudo obtener tu ubicación. Puedes seleccionarla en el mapa."
        );
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-violet-200">
        <MapContainer
          center={value ? [value.lat, value.lng] : AREQUIPA}
          zoom={14}
          scrollWheelZoom={false}
          className="h-64 w-full"
          style={{ zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onSelect={selectPoint} />

          <MapRecenter position={value} />

          {value && (
            <Marker
              position={[value.lat, value.lng]}
              icon={markerIcon}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const position =
                    event.target.getLatLng();

                  selectPoint(
                    position.lat,
                    position.lng
                  );
                }
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin size={17} className="text-violet-600" />

          {value
            ? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`
            : "Selecciona un punto en el mapa"}
        </div>

        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-violet-400 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50"
        >
          {loading ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <LocateFixed size={17} />
          )}

          {loading ? "Localizando..." : "Usar mi ubicación"}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
