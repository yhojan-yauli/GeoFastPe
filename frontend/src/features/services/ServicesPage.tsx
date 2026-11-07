
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench, Plus, Search, House, Car,
  HeartPulse, GraduationCap, LayoutGrid,
  MapPin, Star, Heart
} from "lucide-react";

export interface Servicio {
  id: number;
  nombre: string;
  categoria: string;
  ubicacion: string;
  distancia: string;
  puntuacion: string;
  imagen: string;
  descripcion?: string;
  precio?: number;
  lat?: number;
  lng?: number;
}

interface ServicesPageProps {
  servicios?: Servicio[];
}

const serviciosIniciales: Servicio[] = [
  {
    id: 1,
    nombre: "Electricista a domicilio",
    categoria: "Hogar",
    ubicacion: "Cayma",
    distancia: "1.2 km",
    puntuacion: "4.8",
    imagen:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400"
  },
  {
    id: 2,
    nombre: "Gasfitería y plomería",
    categoria: "Hogar",
    ubicacion: "Yanahuara",
    distancia: "2.5 km",
    puntuacion: "4.7",
    imagen:
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400"
  },
  {
    id: 3,
    nombre: "Transporte y mudanzas",
    categoria: "Transporte",
    ubicacion: "Cercado",
    distancia: "3.1 km",
    puntuacion: "4.6",
    imagen:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400"
  },
  {
    id: 4,
    nombre: "Clases de matemáticas",
    categoria: "Educación",
    ubicacion: "José Luis Bustamante",
    distancia: "1.8 km",
    puntuacion: "4.9",
    imagen:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400"
  }
];

const categorias = [
  { nombre: "Todos", icono: LayoutGrid },
  { nombre: "Hogar", icono: House },
  { nombre: "Transporte", icono: Car },
  { nombre: "Salud", icono: HeartPulse },
  { nombre: "Educación", icono: GraduationCap },
  { nombre: "Otros", icono: LayoutGrid }
];

export default function ServicesPage({
  servicios = serviciosIniciales
}: ServicesPageProps) {
  const navigate = useNavigate();

  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [detalle, setDetalle] = useState<Servicio | null>(null);

  const serviciosFiltrados = useMemo(() => {
    return servicios.filter((servicio) => {
      const coincideCategoria =
        categoriaActiva === "Todos" ||
        servicio.categoria === categoriaActiva;

      const texto = `${servicio.nombre} ${servicio.ubicacion} ${servicio.descripcion ?? ""}`
        .toLowerCase();

      const coincideBusqueda = texto.includes(
        busqueda.trim().toLowerCase()
      );

      return coincideCategoria && coincideBusqueda;
    });
  }, [servicios, categoriaActiva, busqueda]);

  const cambiarFavorito = (id: number) => {
    setFavoritos((actuales) =>
      actuales.includes(id)
        ? actuales.filter((item) => item !== id)
        : [...actuales, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Wrench size={42} className="text-violet-700" />

          <div>
            <h1 className="text-3xl font-bold text-[#15143d]">
              Servicios Locales
            </h1>
            <p className="text-sm text-slate-500">
              Encuentra, ofrece o publica servicios en tu comunidad.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/servicios/publicar")}
          className="flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white hover:bg-violet-800"
        >
          <Plus size={20} />
          Crear servicio
        </button>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <Search size={20} className="text-violet-600" />

        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar servicios en GeoFastPe..."
          className="w-full bg-transparent outline-none"
        />
      </div>

      {/* Filtros por categoría */}
      <div className="flex flex-wrap gap-3">
        {categorias.map(({ nombre, icono: Icon }) => (
          <button
            key={nombre}
            type="button"
            onClick={() => setCategoriaActiva(nombre)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              categoriaActiva === nombre
                ? "border-violet-700 bg-violet-700 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-violet-500"
            }`}
          >
            <Icon size={19} />
            {nombre}
          </button>
        ))}
      </div>

      {/* Cantidad de resultados */}
      <h2 className="text-xl font-bold text-[#15143d]">
        Servicios disponibles ({serviciosFiltrados.length})
      </h2>

      {/* Listado */}
      <div className="space-y-4">
        {serviciosFiltrados.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <Search size={36} className="mx-auto mb-3 text-slate-400" />
            <h3 className="font-semibold text-slate-700">
              No se encontraron servicios
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Prueba otra búsqueda o selecciona una categoría diferente.
            </p>
          </div>
        ) : (
          serviciosFiltrados.map((servicio) => (
            <article
              key={servicio.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <img
                src={servicio.imagen}
                alt={servicio.nombre}
                className="h-28 w-36 rounded-xl object-cover"
              />

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-[#15143d]">
                  {servicio.nombre}
                </h3>

                <div className="mt-2 flex items-center gap-2">
                  <Star
                    size={17}
                    className="fill-amber-400 text-amber-400"
                  />
                  <span className="font-semibold">
                    {servicio.puntuacion}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-1 text-sm text-slate-600">
                  <MapPin size={16} />
                  A {servicio.distancia} · {servicio.ubicacion}
                </div>

                <span className="mt-2 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs text-violet-700">
                  {servicio.categoria}
                </span>
              </div>

              <div className="flex flex-col items-end gap-5">
                <button
                  type="button"
                  aria-label="Agregar a favoritos"
                  onClick={() => cambiarFavorito(servicio.id)}
                >
                  <Heart
                    size={23}
                    className={
                      favoritos.includes(servicio.id)
                        ? "fill-violet-600 text-violet-600"
                        : "text-slate-700"
                    }
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setDetalle(servicio)}
                  className="rounded-lg border border-violet-400 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50"
                >
                  Ver detalle
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Modal de detalle */}
      {detalle && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDetalle(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-3 text-2xl font-bold">
              {detalle.nombre}
            </h2>

            <p className="mb-2 text-slate-600">
              {detalle.descripcion || "Servicio disponible en la comunidad."}
            </p>

            <p className="mb-2">
              <strong>Categoría:</strong> {detalle.categoria}
            </p>

            <p className="mb-2">
              <strong>Ubicación:</strong> {detalle.ubicacion}
            </p>

            {detalle.precio !== undefined && (
              <p>
                <strong>Precio:</strong> S/ {detalle.precio}
              </p>
            )}

            <button
              onClick={() => setDetalle(null)}
              className="mt-6 rounded-xl bg-violet-700 px-5 py-2 text-white"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
