
import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [-77.042793, -12.046374],
      zoom: 14,
      attributionControl: {},
    });

    map.addControl(
      new maplibregl.NavigationControl(),
      "top-right"
    );

    map.on("load", () => {
      console.log("Mapa GeoFastPe cargado correctamente");
      map.resize();
    });

    map.on("error", (event) => {
      console.error("Error de MapLibre:", event.error);
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5">
        <h2 className="text-xl font-bold text-slate-800">
          Mapa Vecinal
        </h2>

        <p className="text-sm text-slate-500">
          Explora servicios y publicaciones cercanas.
        </p>
      </div>

      <div
        ref={mapContainer}
        className="h-[420px] w-full md:h-[550px]"
      />
    </section>
  );
}
