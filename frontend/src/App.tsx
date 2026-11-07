
import MainLayout from "./components/layout/MainLayout";
import MapView from "./features/maps/components/MapView";

export default function App() {
  return (
    <MainLayout>
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
    </MainLayout>
  );
}
