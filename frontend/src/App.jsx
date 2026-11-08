
import { useEffect, useState } from 'react';

// ==========================================
// COMPONENTES DEL MAPA
// ==========================================
import MapView from './components/views/MapView.jsx';
import ConnectivityView from './components/views/ConnectivityView.jsx';
import SearchView from './components/views/SearchView.jsx';
import LayerSwitcherView from './components/views/LayerSwitcherView.jsx';
import TransportLegendView from './components/views/TransportLegendView.jsx';
import FloatingActionsView from './components/views/FloatingActionsView.jsx';
import RouteModesView from './components/views/RouteModesView.jsx';
import RadiusPanelView from './components/views/RadiusPanelView.jsx';
import WeatherView from './components/views/WeatherView.jsx';
import RotationView from './components/views/RotationView.jsx';
import StatusToastView from './components/views/StatusToastView.jsx';

// ==========================================
// NAVEGACIÓN
// ==========================================
import Sidebar from './components/layout/Sidebar.jsx';
import SidePanel from './components/layout/SidePanel.jsx';

// ==========================================
// AUTENTICACIÓN
// ==========================================
import AuthModal from './features/auth/AuthModal.jsx';
import LoginRequired from './features/auth/LoginRequired.jsx';
import { useAuth } from './features/auth/AuthContext.jsx';

// ==========================================
// SERVICIOS
// ==========================================
import ServicesPage from './features/services/ServicesPage.jsx';
import PublishService from './features/services/PublishService.jsx';

// ==========================================
// MOTOR DEL MAPA
// ==========================================
import { initializeGeoFastPe } from './engine/geoFastEngine.js';

const PRIVATE_SECTIONS = [
  'Mensajes',
  'Mi Perfil',
  'Configuración'
];

export default function App() {
  const { isAuthenticated } = useAuth();

  // ==========================================
  // ESTADOS DEL MAPA
  // ==========================================
  const [section, setSection] = useState('Inicio');
  const [services, setServices] = useState([]);
  const [radius, setRadius] = useState(1000);

  // ==========================================
  // ESTADOS DE SERVICIOS
  // ==========================================
  const [showServicesDetail, setShowServicesDetail] =
    useState(false);

  const [showPublishService, setShowPublishService] =
    useState(false);

  const [selectedService, setSelectedService] =
    useState(null);

  // ==========================================
  // ESTADOS DE AUTENTICACIÓN
  // ==========================================
  const [showLoginRequired, setShowLoginRequired] =
    useState(false);

  const [authMode, setAuthMode] = useState(null);

  const [pendingSection, setPendingSection] =
    useState(null);

  const [pendingAction, setPendingAction] =
    useState(null);

  // ==========================================
  // INICIALIZACIÓN DEL MAPA
  // ==========================================
  useEffect(() => {
    initializeGeoFastPe();

    const receive = (event) => {
      setServices(event.detail?.services || []);
      setRadius(event.detail?.radius ?? 1000);
    };

    window.addEventListener(
      'geofastpe:services',
      receive
    );

    const timer = setInterval(() => {
      if (window.GeoFastPe) {
        const state = window.GeoFastPe.getState();

        if (state) {
          setRadius(state.radius);
        }
      }
    }, 500);

    return () => {
      window.removeEventListener(
        'geofastpe:services',
        receive
      );

      clearInterval(timer);
    };
  }, []);

  // ==========================================
  // AUTENTICACIÓN
  // ==========================================
  const requireLogin = (
    targetSection = null,
    targetAction = null
  ) => {
    setPendingSection(
      typeof targetSection === 'string'
        ? targetSection
        : null
    );

    setPendingAction(targetAction);
    setAuthMode(null);
    setShowLoginRequired(true);
  };

  const closeLoginRequired = () => {
    setShowLoginRequired(false);
    setPendingSection(null);
    setPendingAction(null);
  };

  const openLogin = () => {
    setShowLoginRequired(false);
    setAuthMode('login');
  };

  const openRegister = () => {
    setShowLoginRequired(false);
    setAuthMode('register');
  };

  const closeAuth = () => {
    setAuthMode(null);
    setPendingSection(null);
    setPendingAction(null);
  };

  // ==========================================
  // ACCESO EN MODO DEMOSTRACIÓN
  // ==========================================
  const completeDemoLogin = () => {
    setAuthMode(null);
    setShowLoginRequired(false);

    // Si intentó publicar, abrir el formulario
    if (pendingAction === 'publish-service') {
      setSection('Servicios');
      setShowServicesDetail(true);
      setShowPublishService(true);
    }

    // Si intentó entrar a una sección privada
    else if (pendingSection) {
      setSection(pendingSection);
      setShowServicesDetail(false);
      setShowPublishService(false);
    }

    // Si inició sesión desde el panel derecho,
    // permanecer en la pantalla actual.

    setPendingSection(null);
    setPendingAction(null);
  };

  // ==========================================
  // NAVEGACIÓN DEL SIDEBAR
  // ==========================================
  const selectSection = (
    name,
    category = 'Todos'
  ) => {
    // Solo estas secciones requieren sesión
    if (
      PRIVATE_SECTIONS.includes(name) &&
      !isAuthenticated
    ) {
      requireLogin(name);
      return;
    }

    // Servicios sigue siendo público
    setSection(name);

    // Regresar siempre al mapa al seleccionar
    // una opción del Sidebar
    setShowServicesDetail(false);
    setShowPublishService(false);
    setSelectedService(null);

    const selectedCategory =
      PRIVATE_SECTIONS.includes(name)
        ? 'Todos'
        : category;

    // Mantener el filtrado original del mapa
    if (window.GeoFastPe) {
      window.GeoFastPe.setCategory(
        selectedCategory
      );
    } else {
      window.addEventListener(
        'geofastpe:services',
        () => {
          window.GeoFastPe?.setCategory(
            selectedCategory
          );
        },
        { once: true }
      );
    }
  };

  // ==========================================
  // RADIO DE BÚSQUEDA
  // ==========================================
  const changeRadius = (value) => {
    setRadius(value);

    const slider = document.getElementById(
      'radius-slider'
    );

    if (slider) {
      slider.value = String(value);

      slider.dispatchEvent(
        new Event('input', {
          bubbles: true
        })
      );
    }
  };

  // ==========================================
  // ABRIR SERVICIOS DESDE EL PANEL DERECHO
  // ==========================================
  const openServicesDetail = (service) => {
    setSelectedService(service ?? null);

    setShowPublishService(false);
    setShowServicesDetail(true);
  };

  // ==========================================
  // PUBLICAR SERVICIO
  // ==========================================
  const openPublishService = () => {
    if (!isAuthenticated) {
      requireLogin(
        null,
        'publish-service'
      );
      return;
    }

    setSection('Servicios');
    setShowServicesDetail(true);
    setShowPublishService(true);
  };

  // ==========================================
  // REGRESAR AL LISTADO DE SERVICIOS
  // ==========================================
  const backToServices = () => {
    setShowPublishService(false);
    setShowServicesDetail(true);
  };

  // ==========================================
  // REGRESAR AL MAPA
  // ==========================================
  const backToMap = () => {
    setShowServicesDetail(false);
    setShowPublishService(false);
    setSelectedService(null);

    setSection('Servicios');

    window.GeoFastPe?.setCategory('Servicios');
  };

  // ==========================================
  // CONTROL AL CERRAR SESIÓN
  // ==========================================
  useEffect(() => {
    if (!isAuthenticated) {
      setShowPublishService(false);

      // Servicios NO es privado
      if (PRIVATE_SECTIONS.includes(section)) {
        setSection('Inicio');
      }
    }
  }, [isAuthenticated, section]);

  // ==========================================
  // CONTROL DE VISTAS
  // ==========================================
  const showServicesPage =
    showServicesDetail || showPublishService;

  const showMapInterface =
    !showServicesPage;

  // ==========================================
  // INTERFAZ PRINCIPAL
  // ==========================================
  return (
    <main className="geofastpe-app">

      {/* =====================================
          MAPA ORIGINAL
          NO SE DESMONTA AL CAMBIAR DE VISTA
      ===================================== */}
      <div
        className={`geofastpe-map-workspace ${
          showMapInterface
            ? ''
            : 'workspace-hidden'
        }`}
      >
        <MapView />

        <ConnectivityView />
        <SearchView />
        <LayerSwitcherView />
        <TransportLegendView />
        <FloatingActionsView />
        <RouteModesView />
        <RadiusPanelView />
        <WeatherView />
        <RotationView />
        <StatusToastView />
      </div>

      {/* =====================================
          ESTRUCTURA PRINCIPAL
      ===================================== */}
      <div className="app-shell">

        {/* SIDEBAR */}
        <Sidebar
          section={section}
          onSelectSection={selectSection}
          onRequireLogin={requireLogin}
        />

        {/* =================================
            PANEL DERECHO DEL MAPA
        ================================= */}
        <div
          className={`geofastpe-panel-workspace ${
            showMapInterface
              ? ''
              : 'workspace-hidden'
          }`}
        >
          <SidePanel
            section={section}
            services={services}
            radius={radius}
            onRadiusChange={changeRadius}
            onLogin={openLogin}
            onRegister={openRegister}
            onViewService={openServicesDetail}
          />
        </div>

        {/* =================================
            PÁGINA COMPLETA DE SERVICIOS
            SOLO SE ABRE DESDE EL PANEL
        ================================= */}
        {showServicesPage && (
          <div className="geofastpe-content-workspace">

            {showPublishService ? (
              <PublishService
                onBack={backToServices}
              />
            ) : (
              <div>
                <button
                  type="button"
                  className="publish-back"
                  onClick={backToMap}
                  style={{
                    margin: '16px 0 0 32px'
                  }}
                >
                  ← Volver al mapa
                </button>

                <ServicesPage
                  services={
                    selectedService
                      ? [selectedService]
                      : services
                  }
                  onCreateService={openPublishService}
                  onRequireLogin={() => {
                    requireLogin(
                      null,
                      'publish-service'
                    );
                  }}
                />
              </div>
            )}

          </div>
        )}

      </div>

      {/* =====================================
          AVISO DE AUTENTICACIÓN
      ===================================== */}
      {showLoginRequired && (
        <LoginRequired
          onClose={closeLoginRequired}
          onLogin={openLogin}
          onRegister={openRegister}
        />
      )}

      {/* =====================================
          LOGIN Y REGISTRO
      ===================================== */}
      {authMode && (
        <AuthModal
          key={authMode}
          mode={authMode}
          onClose={closeAuth}
          onDemoLogin={completeDemoLogin}
        />
      )}

    </main>
  );
}
