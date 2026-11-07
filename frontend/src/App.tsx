
import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate
} from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

// MAPAS
import MapSection from "./features/maps/components/MapSection";

// PÁGINAS PERSONALES
import ProfilePage from "./pages/ProfilePage";
import SolidarityPage from "./pages/SolidarityPage";
import RequestHelpPage from "./pages/RequestHelpPage";

// SOLIDARIDAD
import { initialSolidarityPosts } from "./features/solidarity/data/solidarityData";
import type { SolidarityPost } from "./features/solidarity/types/solidarity.types";

// SERVICIOS DEL EQUIPO
import ServicesPage, {
  type Servicio
} from "./features/services/ServicesPage";

import PublishServicePage from "./features/services/PublishServicePage";

// INICIO
function HomePage() {
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

      <MapSection />
    </div>
  );
}

// APLICACIÓN
function AppContent() {
  const navigate = useNavigate();

  // ESTADO DE SERVICIOS
  const [servicios, setServicios] = useState<Servicio[]>([]);

  const agregarServicio = (nuevo: Servicio) => {
    setServicios((actuales) => [nuevo, ...actuales]);
  };

  // ESTADO DE SOLIDARIDAD
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
        <Route path="/" element={<HomePage />} />

        {/* MAPAS */}
        <Route path="/mapa" element={<MapSection />} />

        {/* SERVICIOS */}
        <Route
          path="/servicios"
          element={
            <ServicesPage
              servicios={
                servicios.length > 0 ? servicios : undefined
              }
            />
          }
        />

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
              onCancel={() => navigate("/solidaridad")}
              onPublish={publishRequest}
            />
          }
        />

        {/* PERFIL */}
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

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
