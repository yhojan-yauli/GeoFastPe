import { useMemo, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

// MAPAS
import MapSection from "./features/maps/components/MapSection";

// PÁGINAS
import ProfilePage from "./pages/ProfilePage";
import SolidarityPage from "./pages/SolidarityPage";
import RequestHelpPage from "./pages/RequestHelpPage";

// SOLIDARIDAD
import { initialSolidarityPosts } from "./features/solidarity/data/solidarityData";
import type { SolidarityPost } from "./features/solidarity/types/solidarity.types";

// SERVICIOS
import ServicesPage, {
  type Servicio,
} from "./features/services/ServicesPage";

import PublishServicePage from "./features/services/PublishServicePage";

// SERVICIOS INICIALES
const serviciosIniciales: Servicio[] = [
  {
    id: 1,
    nombre: "Electricista a domicilio",
    categoria: "Hogar",
    ubicacion: "Cayma",
    distancia: "1.2 km",
    puntuacion: "4.8",
    imagen:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400",
  },
  {
    id: 2,
    nombre: "Gasfitería y plomería",
    categoria: "Hogar",
    ubicacion: "Yanahuara",
    distancia: "2.5 km",
    puntuacion: "4.7",
    imagen:
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400",
  },
  {
    id: 3,
    nombre: "Transporte y mudanzas",
    categoria: "Transporte",
    ubicacion: "Cercado",
    distancia: "3.1 km",
    puntuacion: "4.6",
    imagen:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
  },
  {
    id: 4,
    nombre: "Clases de matemáticas",
    categoria: "Educación",
    ubicacion: "José Luis Bustamante",
    distancia: "1.8 km",
    puntuacion: "4.9",
    imagen:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
  },
];

// PÁGINA DE INICIO
function HomePage({
  servicios,
}: {
  servicios: Servicio[];
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">
          Bienvenido a GeoFastPe
        </h1>

        <p className="mt-2 text-slate-500">
          Descubre servicios, conecta con vecinos y
          participa en tu comunidad.
        </p>
      </div>

      <MapSection servicios={servicios} />
    </div>
  );
}

// CONTENIDO PRINCIPAL
function AppContent() {
  const navigate = useNavigate();

  // SERVICIOS PUBLICADOS
  const [serviciosPublicados, setServiciosPublicados] =
    useState<Servicio[]>([]);

  // COMBINAR SERVICIOS INICIALES Y PUBLICADOS
  const todosLosServicios = useMemo(
    () => [
      ...serviciosPublicados,
      ...serviciosIniciales,
    ],
    [serviciosPublicados]
  );

  // AGREGAR NUEVO SERVICIO
  const agregarServicio = (nuevo: Servicio) => {
    setServiciosPublicados((actuales) => [
      nuevo,
      ...actuales,
    ]);
  };

  // SOLIDARIDAD
  const [posts, setPosts] = useState<SolidarityPost[]>(
    initialSolidarityPosts
  );

  const publishRequest = (post: SolidarityPost) => {
    setPosts((previous) => [post, ...previous]);
    navigate("/solidaridad");
  };

  return (
    <MainLayout>
      <Routes>
        {/* INICIO */}
        <Route
          path="/"
          element={
            <HomePage servicios={todosLosServicios} />
          }
        />

        {/* MAPA VECINAL */}
        <Route
          path="/mapa"
          element={
            <MapSection servicios={todosLosServicios} />
          }
        />

        {/* SERVICIOS LOCALES */}
        <Route
          path="/servicios"
          element={
            <ServicesPage
              servicios={todosLosServicios}
            />
          }
        />

        {/* PUBLICAR SERVICIO */}
        <Route
          path="/servicios/publicar"
          element={
            <PublishServicePage
              onPublish={agregarServicio}
            />
          }
        />

        {/* SOLIDARIDAD */}
        <Route
          path="/solidaridad"
          element={
            <SolidarityPage
              posts={posts}
              onRequestHelp={() =>
                navigate("/solicitar-ayuda")
              }
              onDonate={() =>
                navigate("/solicitar-ayuda")
              }
            />
          }
        />

        {/* SOLICITAR AYUDA */}
        <Route
          path="/solicitar-ayuda"
          element={
            <RequestHelpPage
              onCancel={() =>
                navigate("/solidaridad")
              }
              onPublish={publishRequest}
            />
          }
        />

        {/* MI PERFIL */}
        <Route
          path="/perfil"
          element={<ProfilePage />}
        />

        {/* RUTA NO ENCONTRADA */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </MainLayout>
  );
}

// APLICACIÓN
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
