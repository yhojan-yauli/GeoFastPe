import { useEffect, useState } from 'react';
import EventsPage, { demoEvents } from './features/events/EventsPage.jsx';
import CreateEvent from './features/events/CreateEvent.jsx';
import EventDetail from './features/events/EventDetail.jsx';
import ReportsPage, { demoReports } from './features/reports/ReportsPage.jsx';
import CreateReport from './features/reports/CreateReport.jsx';
import ReportDetail from './features/reports/ReportDetail.jsx';
import EmergencyPage from './features/emergency/EmergencyPage.jsx';
import ReportEmergency from './features/emergency/ReportEmergency.jsx';

// ==========================================
// VENTAS LOCALES
// ==========================================
import SalesPage from './features/sales/SalesPage.jsx';
import PublishSale from './features/sales/PublishSale.jsx';
import SaleDetail from './features/sales/SaleDetail.jsx';

// SOLIDARIDAD
import SolidarityPage from './features/solidarity/SolidarityPage.jsx';
import RequestHelp from './features/solidarity/RequestHelp.jsx';
import PublishDonation from './features/solidarity/PublishDonation.jsx';

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

// MENSAJES PRIVADOS
import MessagesPage from './features/messages/MessagesPage.jsx';

// PERFIL PRIVADO
import ProfilePage from './features/profile/ProfilePage.jsx';

const PRIVATE_SECTIONS = [
  'Mensajes',
  'Mi Perfil',
  'Configuración'
];

export default function App() {
  const { isAuthenticated } = useAuth();

  // ==========================================
// ESTADOS DE VENTAS
// ==========================================
const [salesView, setSalesView] = useState('map');
const [selectedSale, setSelectedSale] = useState(null);
  const [solidarityView, setSolidarityView] = useState('map');
  const [emergencyView, setEmergencyView] = useState('map');
  const [emergencyType, setEmergencyType] = useState('Incendio');
  const [emergencyReports, setEmergencyReports] = useState([]);
  const [reportsView, setReportsView] = useState('map');
  const [selectedReport, setSelectedReport] = useState(null);
  const [citizenReports, setCitizenReports] = useState([]);
  const [eventsView, setEventsView] = useState('map');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [communityEvents, setCommunityEvents] = useState([]);

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

    else if (pendingAction === 'publish-donation' || pendingAction === 'request-help') {
      setSection('Solidaridad');
      setSolidarityView(pendingAction === 'publish-donation' ? 'donate' : 'request');
      setSalesView('map');
      setShowServicesDetail(false);
      setShowPublishService(false);
    }

    else if (pendingAction === 'report-emergency') {
      setSection('Emergencias');
      setEmergencyView('report');
      setSalesView('map');
      setSolidarityView('map');
      setShowServicesDetail(false);
      setShowPublishService(false);
    }

    else if (pendingAction === 'create-report') {
      setSection('Reportes');
      setReportsView('create');
      setSalesView('map');
      setSolidarityView('map');
      setEmergencyView('map');
      setShowServicesDetail(false);
      setShowPublishService(false);
    }

    else if (pendingAction === 'create-event') {
      setSection('Eventos');
      setEventsView('create');
      setSalesView('map');
      setSolidarityView('map');
      setEmergencyView('map');
      setReportsView('map');
      setShowServicesDetail(false);
      setShowPublishService(false);
    }

    else if (pendingAction === 'publish-sale') {
      setSection('Ventas');
      setSalesView('publish');
      setShowServicesDetail(false);
      setShowPublishService(false);
    }

    // Si intentó entrar a una sección privada
    else if (pendingSection) {
      setSection(pendingSection);
      setShowServicesDetail(false);
      setShowPublishService(false);
      setSalesView('map');
      setSolidarityView('map');
      setEmergencyView('map');
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
    setSalesView('map');
    setSelectedSale(null);
    setSolidarityView('map');
    setEmergencyView('map');
    setReportsView('map');
    setSelectedReport(null);
    setEventsView('map');
    setSelectedEvent(null);

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
  // NAVEGACIÓN DE VENTAS
  // ==========================================
  const openSalesCatalog = () => {
    setSection('Ventas');
    setShowServicesDetail(false);
    setShowPublishService(false);
    setSelectedSale(null);
    setSalesView('catalog');
  };

  const openSaleDetail = (product) => {
    setSection('Ventas');
    setSelectedSale(product);
    setSalesView('detail');
  };

  const openPublishSale = () => {
    if (!isAuthenticated) {
      requireLogin(null, 'publish-sale');
      return;
    }
    setSection('Ventas');
    setShowServicesDetail(false);
    setShowPublishService(false);
    setSalesView('publish');
  };

  const backToSales = () => {
    setSection('Ventas');
    setSelectedSale(null);
    setSalesView('catalog');
  };

  const backToSalesMap = () => {
    setSection('Ventas');
    setSelectedSale(null);
    setSalesView('map');
    window.GeoFastPe?.setCategory('Ventas');
  };

  // ==========================================
  // NAVEGACIÓN DE SOLIDARIDAD
  // ==========================================
  const openSolidarity = () => {
    setSection('Solidaridad');
    setShowServicesDetail(false);
    setShowPublishService(false);
    setSalesView('map');
    setSolidarityView('catalog');
  };

  const openSolidarityForm = (kind) => {
    if (!isAuthenticated) {
      requireLogin(null, kind === 'donate' ? 'publish-donation' : 'request-help');
      return;
    }
    setSection('Solidaridad');
    setSolidarityView(kind);
  };

  const backToSolidarityMap = () => {
    setSection('Solidaridad');
    setSolidarityView('map');
    window.GeoFastPe?.setCategory('Solidaridad');
  };

  // ==========================================
  // EMERGENCIAS SOS (demostración en memoria)
  // ==========================================
  const openEmergencies = () => {
    setSection('Emergencias');
    setSalesView('map');
    setSolidarityView('map');
    setShowServicesDetail(false);
    setShowPublishService(false);
    setEmergencyView('catalog');
  };

  const openEmergencyForm = (type = 'Incendio') => {
    setEmergencyType(type);
    if (!isAuthenticated) {
      requireLogin(null, 'report-emergency');
      return;
    }
    setSection('Emergencias');
    setEmergencyView('report');
  };

  const saveEmergencyReport = (report) => {
    setEmergencyReports((previous) => [report, ...previous]);
    setEmergencyView('catalog');
  };

  const backToEmergenciesMap = () => {
    setSection('Emergencias');
    setEmergencyView('map');
    window.GeoFastPe?.setCategory('Emergencias');
  };

  // ==========================================
  // REPORTES COMUNITARIOS (estado local)
  // ==========================================
  const openReports = () => {
    setSection('Reportes');
    setSalesView('map');
    setSolidarityView('map');
    setEmergencyView('map');
    setShowServicesDetail(false);
    setShowPublishService(false);
    setReportsView('catalog');
  };

  const openCreateReport = () => {
    if (!isAuthenticated) {
      requireLogin(null, 'create-report');
      return;
    }
    setSection('Reportes');
    setReportsView('create');
  };

  const openReportDetail = (report) => {
    setSelectedReport(report);
    setSection('Reportes');
    setReportsView('detail');
  };

  const saveCitizenReport = (report) => {
    setCitizenReports((previous) => [report, ...previous]);
    setReportsView('catalog');
  };

  const backToReportsMap = () => {
    setSection('Reportes');
    setReportsView('map');
    window.GeoFastPe?.setCategory('Reportes');
  };

  // ==========================================
  // EVENTOS COMUNITARIOS (estado local)
  // ==========================================
  const openEvents = () => {
    setSection('Eventos');
    setSalesView('map');
    setSolidarityView('map');
    setEmergencyView('map');
    setReportsView('map');
    setShowServicesDetail(false);
    setShowPublishService(false);
    setEventsView('catalog');
  };

  const openCreateEvent = () => {
    if (!isAuthenticated) {
      requireLogin(null, 'create-event');
      return;
    }
    setSection('Eventos');
    setEventsView('create');
  };

  const openEventDetail = (event) => {
    setSelectedEvent(event);
    setSection('Eventos');
    setEventsView('detail');
  };

  const saveCommunityEvent = (event) => {
    setCommunityEvents((previous) => [event, ...previous]);
    setEventsView('catalog');
  };

  const backToEventsMap = () => {
    setSection('Eventos');
    setEventsView('map');
    window.GeoFastPe?.setCategory('Eventos');
  };

  // ==========================================
  // CONTROL AL CERRAR SESIÓN
  // ==========================================
  useEffect(() => {
    if (!isAuthenticated) {
      setShowPublishService(false);
      setSalesView((current) => current === 'publish' ? 'catalog' : current);
      setSolidarityView((current) => ['donate', 'request'].includes(current) ? 'catalog' : current);
      setEmergencyView((current) => current === 'report' ? 'catalog' : current);
      setReportsView((current) => current === 'create' ? 'catalog' : current);
      setEventsView((current) => current === 'create' ? 'catalog' : current);

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

  const showSalesPage = section === 'Ventas' && salesView !== 'map';

  const showSolidarityPage = section === 'Solidaridad' && solidarityView !== 'map';

  const showEmergencyPage = section === 'Emergencias' && emergencyView !== 'map';

  const showReportsPage = section === 'Reportes' && reportsView !== 'map';
  const showEventsPage = section === 'Eventos' && eventsView !== 'map';
  const showMessagesPage = section === 'Mensajes' && isAuthenticated;
  const showProfilePage = section === 'Mi Perfil' && isAuthenticated;

  const showMapInterface =
    !showServicesPage && !showSalesPage && !showSolidarityPage && !showEmergencyPage && !showReportsPage && !showEventsPage && !showMessagesPage && !showProfilePage;

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
            onViewSalesCatalog={openSalesCatalog}
            onViewSolidarity={openSolidarity}
            onViewEmergencies={openEmergencies}
            emergencyReports={emergencyReports}
            onViewReports={openReports}
            citizenReports={citizenReports}
            onViewEvents={openEvents}
            communityEvents={communityEvents}
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

        {/* SOLIDARIDAD: LISTADO, SOLICITUD Y DONACIÓN */}
        {showSolidarityPage && (
          <div className="geofastpe-content-workspace">
            {solidarityView === 'donate' ? (
              <PublishDonation onBack={openSolidarity} />
            ) : solidarityView === 'request' ? (
              <RequestHelp onBack={openSolidarity} />
            ) : (
              <div>
                <button
                  type="button"
                  className="publish-back"
                  onClick={backToSolidarityMap}
                  style={{ margin: '16px 0 0 32px' }}
                >
                  ← Volver al mapa
                </button>
                <SolidarityPage
                  onPublishDonation={() => openSolidarityForm('donate')}
                  onRequestHelp={() => openSolidarityForm('request')}
                />
              </div>
            )}
          </div>
        )}

        {/* EMERGENCIAS: LISTADO Y FORMULARIO */}
        {showEmergencyPage && (
          <div className="geofastpe-content-workspace">
            {emergencyView === 'report' ? (
              <ReportEmergency
                initialType={emergencyType}
                onBack={openEmergencies}
                onSubmit={saveEmergencyReport}
              />
            ) : (
              <div>
                <button type="button" className="publish-back" onClick={backToEmergenciesMap} style={{ margin: '16px 0 0 32px' }}>
                  ← Volver al mapa
                </button>
                <EmergencyPage reports={emergencyReports} onReport={openEmergencyForm} />
              </div>
            )}
          </div>
        )}

        {/* REPORTES: LISTADO, CREACIÓN Y DETALLE */}
        {showReportsPage && (
          <div className="geofastpe-content-workspace">
            {reportsView === 'create' ? (
              <CreateReport onBack={openReports} onSubmitReport={saveCitizenReport} />
            ) : reportsView === 'detail' ? (
              <ReportDetail report={selectedReport} onBack={openReports} />
            ) : (
              <div>
                <button type="button" className="publish-back" onClick={backToReportsMap} style={{ margin: '16px 0 0 32px' }}>
                  ← Volver al mapa
                </button>
                <ReportsPage
                  reports={[...citizenReports, ...demoReports]}
                  onCreateReport={openCreateReport}
                  onViewReport={openReportDetail}
                />
              </div>
            )}
          </div>
        )}

        {/* EVENTOS: CATÁLOGO, CREACIÓN Y DETALLE */}
        {showEventsPage && (
          <div className="geofastpe-content-workspace">
            {eventsView === 'create' ? (
              <CreateEvent onBack={openEvents} onSubmitEvent={saveCommunityEvent} />
            ) : eventsView === 'detail' ? (
              <EventDetail event={selectedEvent} onBack={openEvents} />
            ) : (
              <div>
                <button type="button" className="publish-back" onClick={backToEventsMap} style={{ margin: '16px 0 0 32px' }}>
                  ← Volver al mapa
                </button>
                <EventsPage
                  events={[...communityEvents, ...demoEvents]}
                  onCreateEvent={openCreateEvent}
                  onViewEvent={openEventDetail}
                />
              </div>
            )}
          </div>
        )}

        {/* MENSAJES: VISTA PRIVADA, SOLO CON SESIÓN ACTIVA */}
        {showMessagesPage && (
          <div className="geofastpe-content-workspace">
            <MessagesPage isAuthenticated={isAuthenticated} />
          </div>
        )}

        {/* MI PERFIL: VISTA PRIVADA, SOLO CON SESIÓN ACTIVA */}
        {showProfilePage && (
          <div className="geofastpe-content-workspace">
            <ProfilePage isAuthenticated={isAuthenticated} />
          </div>
        )}

        {/* VENTAS: CATÁLOGO, DETALLE Y PUBLICACIÓN */}
        {showSalesPage && (
          <div className="geofastpe-content-workspace">
            {salesView === 'publish' ? (
              <PublishSale onBack={backToSales} />
            ) : salesView === 'detail' ? (
              <SaleDetail
                product={selectedSale}
                onBack={backToSales}
              />
            ) : (
              <div>
                <button
                  type="button"
                  className="publish-back"
                  onClick={backToSalesMap}
                  style={{ margin: '16px 0 0 32px' }}
                >
                  ← Volver al mapa
                </button>
                <SalesPage
                  onCreateSale={openPublishSale}
                  onViewSale={openSaleDetail}
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
