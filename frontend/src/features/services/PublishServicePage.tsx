
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Wrench,
  MapPin,
  ImagePlus,
  Send,
  LocateFixed,
  House,
  CalendarDays
} from "lucide-react";

import ServiceLocationPicker, {
  type ServiceLocation
} from "../maps/components/ServiceLocationPicker";


import type { Servicio } from "./ServicesPage";

interface Props {
  onPublish?: (servicio: Servicio) => void;
}

type LocationMode = "gps" | "address";

export default function PublishServicePage({
  onPublish
}: Props) {
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("Hogar");
  const [tipo, setTipo] = useState("Servicio a domicilio");
  const [descripcion, setDescripcion] = useState("");
  const [disponibilidad, setDisponibilidad] = useState("");

  const [locationMode, setLocationMode] =
    useState<LocationMode>("gps");

  const [location, setLocation] =
    useState<ServiceLocation | null>(null);

  const [direccion, setDireccion] = useState("");
  const [imagen, setImagen] = useState("");

  const [error, setError] = useState("");

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-violet-600";

  const seleccionarImagen = (file?: File) => {
    if (!file) return;

    if (
      !["image/png", "image/jpeg"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Selecciona una imagen JPG o PNG de máximo 5 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImagen(String(reader.result));
      setError("");
    };

    reader.readAsDataURL(file);
  };

  const publicar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!titulo.trim() || !descripcion.trim() || !disponibilidad) {
      setError("Completa los campos obligatorios.");
      return;
    }

    if (!location) {
      setError("Selecciona la ubicación del servicio en el mapa.");
      return;
    }

    if (locationMode === "address" && !direccion.trim()) {
      setError("Ingresa la dirección donde prestarás el servicio.");
      return;
    }

    const ubicacionTexto =
      locationMode === "address"
        ? direccion.trim()
        : `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`;

    const nuevoServicio: Servicio = {
      id: Date.now(),
      nombre: titulo.trim(),
      categoria,
      ubicacion: ubicacionTexto,
      distancia: "Por calcular",
      puntuacion: "0.0",
      imagen:
        imagen ||
        "https://placehold.co/400x300?text=GeoFastPe",
      descripcion: descripcion.trim(),
      lat: location.lat,
      lng: location.lng,
    };

    onPublish?.(nuevoServicio);

    navigate("/servicios");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">

      {/* Regresar */}
      <button
        type="button"
        onClick={() => navigate("/servicios")}
        className="flex items-center gap-2 font-semibold text-violet-700"
      >
        <ArrowLeft size={20} />
        Volver a Servicios Locales
      </button>

      {/* Encabezado */}
      <div className="flex items-center gap-4 rounded-2xl bg-violet-100 p-6">
        <Wrench size={42} className="text-violet-700" />

        <div>
          <h1 className="text-3xl font-bold text-[#15143d]">
            Publicar Nuevo Servicio
          </h1>

          <p className="text-slate-600">
            Ofrece un servicio a tu comunidad.
          </p>
        </div>
      </div>

      <form
        onSubmit={publicar}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >

        {/* Título */}
        <div>
          <label className="mb-2 block font-semibold">
            Título del servicio *
          </label>

          <input
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej. Electricista a domicilio"
            className={inputClass}
          />
        </div>

        {/* Categoría y tipo */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold">
              Categoría *
            </label>

            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className={inputClass}
            >
              <option>Hogar</option>
              <option>Transporte</option>
              <option>Salud</option>
              <option>Educación</option>
              <option>Otros</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Tipo de servicio *
            </label>

            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className={inputClass}
            >
              <option>Servicio a domicilio</option>
              <option>Servicio presencial</option>
              <option>Servicio virtual</option>
            </select>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="mb-2 block font-semibold">
            Descripción *
          </label>

          <textarea
            required
            maxLength={500}
            rows={4}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describe tu servicio, horarios y experiencia..."
            className={inputClass}
          />

          <p className="mt-1 text-right text-xs text-slate-500">
            {descripcion.length}/500
          </p>
        </div>

        {/* Ubicación */}
        <section className="space-y-4 rounded-2xl bg-violet-50 p-5">
          <div className="flex items-center gap-3">
            <MapPin size={25} className="text-violet-700" />

            <div>
              <h2 className="font-bold text-[#15143d]">
                Ubicación del servicio *
              </h2>

              <p className="text-sm text-slate-500">
                Indica dónde prestas el servicio.
              </p>
            </div>
          </div>

          {/* Opciones */}
          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setLocationMode("gps")}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left ${
                locationMode === "gps"
                  ? "border-violet-600 bg-white text-violet-700"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <LocateFixed size={21} />
              Mi ubicación (GPS)
            </button>

            <button
              type="button"
              onClick={() => setLocationMode("address")}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left ${
                locationMode === "address"
                  ? "border-violet-600 bg-white text-violet-700"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <House size={21} />
              Dirección específica
            </button>
          </div>

          {locationMode === "address" && (
            <div>
              <label className="mb-2 block font-semibold">
                Dirección del servicio *
              </label>

              <input
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ej. Av. Ejército 123, Cayma, Arequipa"
                className={inputClass}
              />

              <p className="mt-2 text-xs text-slate-500">
                Ingresa la dirección y marca su ubicación en el mapa.
              </p>
            </div>
          )}

          <ServiceLocationPicker
            value={location}
            onChange={setLocation}
          />
        </section>

        {/* Disponibilidad */}
        <div>
          <label className="mb-2 flex items-center gap-2 font-semibold">
            <CalendarDays size={18} className="text-violet-700" />
            Disponibilidad *
          </label>

          <select
            required
            value={disponibilidad}
            onChange={(e) => setDisponibilidad(e.target.value)}
            className={inputClass}
          >
            <option value="">Selecciona tu horario</option>
            <option>Lunes a viernes</option>
            <option>Lunes a sábado</option>
            <option>Todos los días</option>
            <option>Previa coordinación</option>
          </select>
        </div>

        {/* Imagen */}
        <div>
          <label className="mb-2 block font-semibold">
            Imagen del servicio
          </label>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-300 bg-violet-50 p-6 text-violet-700">
            <ImagePlus size={32} />
            <span>Seleccionar imagen</span>
            <span className="text-xs">
              JPG o PNG, máximo 5 MB
            </span>

            <input
              type="file"
              accept="image/png,image/jpeg"
              hidden
              onChange={(e) =>
                seleccionarImagen(e.target.files?.[0])
              }
            />
          </label>

          {imagen && (
            <img
              src={imagen}
              alt="Vista previa"
              className="mt-3 h-32 w-40 rounded-xl object-cover"
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        {/* Acciones */}
        <div className="flex flex-wrap justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate("/servicios")}
            className="rounded-xl border border-slate-300 px-8 py-3 font-semibold"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-violet-700 px-8 py-3 font-semibold text-white hover:bg-violet-800"
          >
            <Send size={19} />
            Publicar servicio
          </button>
        </div>
      </form>
    </div>
  );
}
