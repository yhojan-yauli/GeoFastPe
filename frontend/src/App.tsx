
import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import MapView from "./features/maps/components/MapView";

import ServicesPage, {
  type Servicio
} from "./features/services/ServicesPage";

import PublishServicePage from "./features/services/PublishServicePage";

function HomePage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">
          Bienvenido a GeoFastPe
        </h1>

        <p className="mt-2 text-slate-500">
          Descubre servicios, conecta con vecinos y participa en tu comunidad.
        </p>
      </div>

      <MapView />
    </div>
  );
}

export default function App() {
  const [servicios, setServicios] = useState<Servicio[]>([]);

  const agregarServicio = (nuevo: Servicio) => {
    setServicios((actuales) => [nuevo, ...actuales]);
  };

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/mapa" element={<MapView />} />

          <Route
            path="/servicios"
            element={
              <ServicesPage
                servicios={servicios.length > 0 ? servicios : undefined}
              />
            }
          />

          <Route
            path="/servicios/publicar"
            element={
              <PublishServicePage onPublish={agregarServicio} />
            }
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
