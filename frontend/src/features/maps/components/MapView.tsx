import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type { Feature, Polygon } from "geojson";
import type { MapLocation } from "../types/map.types";

interface MapViewProps {
  center: [number, number];
  radius: number;
  locations: MapLocation[];
  onSelectLocation: (location: MapLocation) => void;
}

function createCircle(
  center: [number, number],
  radius: number
): Feature<Polygon> {
  const coordinates: number[][] = [];
  const [lng, lat] = center;

  for (let i = 0; i <= 128; i++) {
    const angle = (i / 128) * Math.PI * 2;
    const latOffset = (radius / 111320) * Math.sin(angle);
    const lngOffset =
      (radius / (111320 * Math.cos((lat * Math.PI) / 180))) *
      Math.cos(angle);

    coordinates.push([lng + lngOffset, lat + latOffset]);
  }

  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [coordinates],
    },
  };
}

export default function MapView({
  center,
  radius,
  locations,
  onSelectLocation,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const onSelectRef = useRef(onSelectLocation);

  useEffect(() => {
    onSelectRef.current = onSelectLocation;
  }, [onSelectLocation]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

        const map = new maplibregl.Map({
        container: containerRef.current,
        style: "https://demotiles.maplibre.org/style.json",
        center: [-77.042793, -12.046374],
        zoom: 12,
        minZoom: 3,
        maxZoom: 19,
        attributionControl: {},
        renderWorldCopies: false,
        pitch: 0,
        bearing: 0,
        });

    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl(),
      "top-right"
    );

    const observer = new ResizeObserver(() => {
      map.resize();
    });

    observer.observe(containerRef.current);

    map.on("error", (event) => {
    console.error("ERROR MAPLIBRE:", event.error);
    });

    map.on("style.load", () => {
    console.log("ESTILO CARGADO:", map.getStyle());
    });

    map.on("idle", () => {
    console.log("MAPA LISTO:", {
        zoom: map.getZoom(),
        center: map.getCenter(),
        styleLoaded: map.isStyleLoaded(),
    });
    });

    return () => {
      observer.disconnect();
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({
      center,
      zoom: 14,
      essential: true,
    });
  }, [center]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateCircle = () => {
      const data = createCircle(center, radius);

      const source = map.getSource("search-radius") as
        | maplibregl.GeoJSONSource
        | undefined;

      if (source) {
        source.setData(data);
        return;
      }

      map.addSource("search-radius", {
        type: "geojson",
        data,
      });

      map.addLayer({
        id: "search-radius-fill",
        type: "fill",
        source: "search-radius",
        paint: {
          "fill-color": "#3b82f6",
          "fill-opacity": 0.12,
        },
      });

      map.addLayer({
        id: "search-radius-line",
        type: "line",
        source: "search-radius",
        paint: {
          "line-color": "#2563eb",
          "line-width": 2,
        },
      });
    };

    if (map.isStyleLoaded()) {
      updateCircle();
    }

    map.on("load", updateCircle);

    return () => {
      map.off("load", updateCircle);
    };
  }, [center, radius]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const colors = {
      Servicio: "#10b981",
      Solidaridad: "#8b5cf6",
      Emergencia: "#ef4444",
    };

    locations.forEach((location) => {
      const element = document.createElement("button");
      element.type = "button";
      element.title = location.name;
      element.setAttribute("aria-label", location.name);

      element.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        background: ${colors[location.category]};
        box-shadow: 0 2px 8px #0005;
        cursor: pointer;
      `;

      element.addEventListener("click", (event) => {
        event.stopPropagation();
        onSelectRef.current(location);
      });

      const marker = new maplibregl.Marker({
        element,
      })
        .setLngLat([location.lng, location.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [locations]);

  return (
    <div
      ref={containerRef}
      className="h-[420px] w-full md:h-[600px]"
    />
  );
}