import type { MapLocation } from "../types/map.types";

interface Props {
  selected: MapLocation | null;
  city: string;
  radius: number;
  onCityChange: (city: string) => void;
  onRadiusChange: (radius: number) => void;
}

export default function MapInfoPanel({
  selected,
  city,
  radius,
  onCityChange,
  onRadiusChange,
}: Props) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800">
        Explorar zona
      </h3>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium">
          Ciudad
        </label>

        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 p-3"
        >
          <option value="lima">Lima</option>
          <option value="arequipa">Arequipa</option>
          <option value="cusco">Cusco</option>
        </select>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm">
          <span>Radio de búsqueda</span>
          <strong>{radius} m</strong>
        </div>

        <input
          type="range"
          min="500"
          max="5000"
          step="500"
          value={radius}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          className="mt-3 w-full accent-blue-600"
        />
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <h4 className="font-semibold text-slate-800">
          Información del marcador
        </h4>

        {selected ? (
          <div className="mt-4 space-y-2">
            <h5 className="font-bold text-blue-700">
              {selected.name}
            </h5>

            <p className="text-sm text-slate-600">
              Categoría: {selected.category}
            </p>

            <p className="text-sm text-slate-600">
              {selected.description}
            </p>

            <p className="text-xs text-slate-400">
              Información de demostración
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            Selecciona un marcador del mapa para ver
            sus detalles aquí.
          </p>
        )}
      </div>
    </aside>
  );
}
