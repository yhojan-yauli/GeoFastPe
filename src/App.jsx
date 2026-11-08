import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import EventsPage from './features/events/EventsPage.jsx';
import CreateEvent from './features/events/CreateEvent.jsx';
import EventDetail from './features/events/EventDetail.jsx';
import ReportsPage from './features/reports/ReportsPage.jsx';
import CreateReport from './features/reports/CreateReport.jsx';
import ReportDetail from './features/reports/ReportDetail.jsx';
import EmergencyPage from './features/emergency/EmergencyPage.jsx';
import ReportEmergency from './features/emergency/ReportEmergency.jsx';

// VENTAS LOCALES
import SalesPage from './features/sales/SalesPage.jsx';
import PublishSale from './features/sales/PublishSale.jsx';
import SaleDetail from './features/sales/SaleDetail.jsx';

// SOLIDARIDAD
import SolidarityPage from './features/solidarity/SolidarityPage.jsx';
import RequestHelp from './features/solidarity/RequestHelp.jsx';
import PublishDonation from './features/solidarity/PublishDonation.jsx';

// COMPONENTES DEL MAPA
import MapView from './components/views/MapView.jsx';
import ConnectivityView from './components/views/ConnectivityView.jsx';
import SearchView from './components/views/SearchView.jsx';
import LayerSwitcherView from './components/views/LayerSwitcherView.jsx';
import TransportLegendView from './components/views/TransportLegendView.jsx';
import FloatingActionsView from './components/views/FloatingActionsView.jsx';
import RouteModesView from './components/views/RouteModesView.jsx';
import WeatherView from './components/views/WeatherView.jsx';
import RotationView from './components/views/RotationView.jsx';
import StatusToastView from './components/views/StatusToastView.jsx';

// NAVEGACIÓN
import Sidebar from './components/layout/Sidebar.jsx';
import SidePanel from './components/layout/SidePanel.jsx';

// AUTENTICACIÓN
import AuthModal from './features/auth/AuthModal.jsx';
import LoginRequired from './features/auth/LoginRequired.jsx';
import { useAuth } from './features/auth/AuthContext.jsx';

// SERVICIOS
import ServicesPage from './features/services/ServicesPage.jsx';
import PublishService from './features/services/PublishService.jsx';

// MOTOR DEL MAPA
import { initializeGeoFastPe } from './engine/geoFastEngine.js';

// MENSAJES, PERFIL Y CONFIGURACIÓN
import MessagesPage from './features/messages/MessagesPage.jsx';
import ProfilePage from './features/profile/ProfilePage.jsx';
import ConfigPage from './features/settings/ConfigPage.jsx';

import {
  eventsApi,
  emergencyApi,
  filesApi,
  reportsApi,
  salesApi,
  servicesApi,
  solidarityApi
} from './api/index.js';

const PRIVATE_SECTIONS = ['Mensajes', 'Mi Perfil', 'Configuración'];

export default function App() {
  const { isAuthenticated } = useAuth();

  // DATOS DESDE LA API
  const [sales, setSales] = useState([]);
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [emergencyReports, setEmergencyReports] = useState([]);
  const [citizenReports, setCitizenReports] = useState([]);
  const [communityEvents, setCommunityEvents] = useState([]);
  const [eventsTab, setEventsTab] = useState('proximos');
  const [servicesCatalog, setServicesCatalog] = useState([]);
  const [notice, setNotice] = useState('');
  const [pendingConversationId, setPendingConversationId] = useState(null);
  const [selectedMessagePublication, setSelectedMessagePublication] = useState(null);

  // VISTAS
  const [salesView, setSalesView] = useState('map');
  const [selectedSale, setSelectedSale] = useState(null);
  const [solidarityView, setSolidarityView] = useState('map');
  const [emergencyView, setEmergencyView] = useState('map');
  const [emergencyType, setEmergencyType] = useState('Incendio');
  const [reportsView, setReportsView] = useState('map');
  const [selectedReport, setSelectedReport] = useState(null);
  const [eventsView, setEventsView] = useState('map');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // MAPA
  const [section, setSection] = useState('Inicio');
  const [services, setServices] = useState([]);
  const [radius, setRadius] = useState(1000);

  // SERVICIOS
  const [showServicesDetail, setShowServicesDetail] = useState(false);
  const [showPublishService, setShowPublishService] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // AUTENTICACIÓN
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [pendingSection, setPendingSection] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  // ==========================================
  // CARGA DE DATOS
  // ==========================================
  const showError = (error) => setNotice(error?.message || 'Ocurrió un error inesperado.');

  // Muestra en el mapa la categoría de un registro recién creado.
const showOnMap = (category, point = null) => {
  const geo = window.GeoFastPe;

  if (!geo) return;

  if (
    point &&
    Number.isFinite(Number(point.lat)) &&
    Number.isFinite(Number(point.lng))
  ) {
    const map = geo.getMap();

    map?.flyTo({
      center: [Number(point.lng), Number(point.lat)],
      zoom: 15,
      essential: true
    });
  }

  geo.setCategory(category);
};

  // SELECCIÓN DE PUNTOS EN EL MAPA: el usuario hace clic y el formulario recibe { lat, lng }.
  const [picking, setPicking] = useState(false);
  const cancelPickRef = useRef(null);

  const pickLocation = () => new Promise((resolve, reject) => {
    const map = window.GeoFastPe?.getMap();
    if (!map) {
      reject(new Error('El mapa todavía no está listo.'));
      return;
    }

    cancelPickRef.current?.();

    const onClick = (event) => {
      cancelPickRef.current = null;
      setPicking(false);
      resolve({ lat: event.lngLat.lat, lng: event.lngLat.lng });
    };

    cancelPickRef.current = () => {
      map.off('click', onClick);
      cancelPickRef.current = null;
      setPicking(false);
      reject(new Error('Selección de ubicación cancelada.'));
    };

    map.once('click', onClick);
    setPicking(true);
  });

  const cancelPick = () => cancelPickRef.current?.();

  const loadSales = async () => {
    try { setSales(await salesApi.listar()); } catch (error) { showError(error); }
  };

  const loadSolidarity = async () => {
    try {
      const [donaciones, solicitudes] = await Promise.all([
        solidarityApi.listar({ tipo: 'DONACION' }),
        solidarityApi.listar({ tipo: 'SOLICITUD' })
      ]);
      setDonations(donaciones);
      setRequests(solicitudes);
    } catch (error) {
      showError(error);
    }
  };

  const loadEmergencies = async () => {
    try { setEmergencyReports(await emergencyApi.listar()); } catch (error) { showError(error); }
  };

  const loadReports = async () => {
    try { setCitizenReports(await reportsApi.listar()); } catch (error) { showError(error); }
  };

  const loadEvents = async (tab = eventsTab) => {
    try {
      if (tab === 'mios' && !isAuthenticated) {
        setCommunityEvents([]);
        return;
      }
      setCommunityEvents(await eventsApi.listar({ tab }));
    } catch (error) {
      showError(error);
    }
  };

  const loadServicesCatalog = async () => {
    try { setServicesCatalog(await servicesApi.listar()); } catch (error) { showError(error); }
  };

  // ==========================================
  // MAPA
  // ==========================================
  useEffect(() => {
    initializeGeoFastPe();

    const receive = (event) => {
      setServices(event.detail?.services || []);
      setRadius(event.detail?.radius ?? 1000);
    };

    window.addEventListener('geofastpe:services', receive);

    const timer = setInterval(() => {
      if (window.GeoFastPe) {
        const state = window.GeoFastPe.getState();
        if (state) setRadius(state.radius);
      }
    }, 500);

    return () => {
      window.removeEventListener('geofastpe:services', receive);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  // ==========================================
  // AUTENTICACIÓN
  // ==========================================
  const requireLogin = (targetSection = null, targetAction = null) => {
    setPendingSection(typeof targetSection === 'string' ? targetSection : null);
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

  // Tras iniciar sesión o registrarse, continúa la acción que estaba pendiente.
  const handleAuthenticated = () => {
    setAuthMode(null);
    setShowLoginRequired(false);

    if (pendingAction === 'publish-service') {
      setSection('Servicios');
      setShowServicesDetail(true);
      setShowPublishService(true);
    } else if (pendingAction === 'publish-donation' || pendingAction === 'request-help') {
      setSection('Solidaridad');
      setSolidarityView(pendingAction === 'publish-donation' ? 'donate' : 'request');
      setSalesView('map');
      setShowServicesDetail(false);
      setShowPublishService(false);
    } else if (pendingAction === 'report-emergency') {
      setSection('Emergencias');
      setEmergencyView('report');
      setSalesView('map');
      setSolidarityView('map');
      setShowServicesDetail(false);
      setShowPublishService(false);
    } else if (pendingAction === 'create-report') {
      setSection('Reportes');
      setReportsView('create');
      setSalesView('map');
      setSolidarityView('map');
      setEmergencyView('map');
      setShowServicesDetail(false);
      setShowPublishService(false);
    } else if (pendingAction === 'create-event') {
      setSection('Eventos');
      setEventsView('create');
      setSalesView('map');
      setSolidarityView('map');
      setEmergencyView('map');
      setReportsView('map');
      setShowServicesDetail(false);
      setShowPublishService(false);
    } else if (pendingAction === 'publish-sale') {
      setSection('Ventas');
      setSalesView('publish');
      setShowServicesDetail(false);
      setShowPublishService(false);
    } else if (pendingSection) {
      setSection(pendingSection);
      setShowServicesDetail(false);
      setShowPublishService(false);
      setSalesView('map');
      setSolidarityView('map');
      setEmergencyView('map');
    }

    setPendingSection(null);
    setPendingAction(null);
  };

  // ==========================================
  // NAVEGACIÓN DEL SIDEBAR
  // ==========================================
  const selectSection = (name, category = 'Todos') => {
    cancelPickRef.current?.();
    // El menú usa "Emergencias (SOS)" y las vistas usan "Emergencias".
    const destino = name === 'Emergencias (SOS)' ? 'Emergencias' : name;

    if (PRIVATE_SECTIONS.includes(destino) && !isAuthenticated) {
      requireLogin(destino);
      return;
    }

    setSection(destino);
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

    const selectedCategory = PRIVATE_SECTIONS.includes(destino) ? 'Todos' : category;

    if (window.GeoFastPe) {
      window.GeoFastPe.setCategory(selectedCategory);
    } else {
      window.addEventListener('geofastpe:services', () => {
        window.GeoFastPe?.setCategory(selectedCategory);
      }, { once: true });
    }
  };

  // ==========================================
  // RADIO DE BÚSQUEDA
  // ==========================================
  const changeRadius = (value) => {
    setRadius(value);
    window.GeoFastPe?.setRadius(value);
  };

  // ==========================================
  // SERVICIOS
  // ==========================================
  const openServicesDetail = async (point) => {
    setShowPublishService(false);
    setShowServicesDetail(true);
    setSelectedService(null);

    if (point?.kind === 'SERVICIO' && point.id != null) {
      try {
        setSelectedService(await servicesApi.obtenerPorId(point.id));
      } catch (error) {
        showError(error);
      }
    }
    loadServicesCatalog();
  };

  const openPublishService = () => {
    if (!isAuthenticated) {
      requireLogin(null, 'publish-service');
      return;
    }
    setSection('Servicios');
    setShowServicesDetail(true);
    setShowPublishService(true);
  };

  const submitService = async (data) => {
    const image = await filesApi.resolverImagen(data.image);
    await servicesApi.crear({ ...data, image });
    await loadServicesCatalog();
    showOnMap('Servicios');
    setShowPublishService(false);
    setShowServicesDetail(true);
    setSelectedService(null);
  };

  const backToServices = () => {
    setShowPublishService(false);
    setShowServicesDetail(true);
  };

  const backToMap = () => {
    setShowServicesDetail(false);
    setShowPublishService(false);
    setSelectedService(null);
    setSection('Servicios');
    window.GeoFastPe?.setCategory('Servicios');
  };

  // ==========================================
  // VENTAS
  // ==========================================
  const openSalesCatalog = () => {
    setSection('Ventas');
    setShowServicesDetail(false);
    setShowPublishService(false);
    setSelectedSale(null);
    setSalesView('catalog');
    loadSales();
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

  const submitSale = async (data) => {
    const image = await filesApi.resolverImagen(data.image);
    await salesApi.crear({ ...data, image });
    await loadSales();
    showOnMap('Ventas');
    setSalesView('catalog');
  };

  const contactSeller = async (product) => {
    if (!isAuthenticated) {
      requireLogin();
      throw new Error('Inicia sesión para contactar al vendedor.');
    }
    const conversacion = await salesApi.contactar(product.id);
    setPendingConversationId(conversacion.id);
    setSalesView('map');
    setSelectedSale(null);
    setSection('Mensajes');
  };

  const backToSales = () => {
    setSection('Ventas');
    setSelectedSale(null);
    setSalesView('catalog');
    loadSales();
  };

  const backToSalesMap = () => {
    setSection('Ventas');
    setSelectedSale(null);
    setSalesView('map');
    window.GeoFastPe?.setCategory('Ventas');
  };

  // ==========================================
  // SOLIDARIDAD
  // ==========================================
  const openSolidarity = () => {
    setSection('Solidaridad');
    setShowServicesDetail(false);
    setShowPublishService(false);
    setSalesView('map');
    setSolidarityView('catalog');
    loadSolidarity();
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

  const submitDonation = async (data) => {
    const image = await filesApi.resolverImagen(data.image);
    await solidarityApi.crear({ ...data, image });
    await loadSolidarity();
    showOnMap('Solidaridad');
    setSolidarityView('catalog');
  };

  const submitRequest = async (data) => {
    const image = await filesApi.resolverImagen(data.image);
    await solidarityApi.crear({ ...data, image });
    await loadSolidarity();
    showOnMap('Solidaridad');
    setSolidarityView('catalog');
  };

  const toggleFavorite = async (item) => {
    if (!isAuthenticated) {
      requireLogin();
      return;
    }
    try {
      if (item.favorito) {
        await solidarityApi.quitarFavorito(item.id);
      } else {
        await solidarityApi.marcarFavorito(item.id);
      }
      await loadSolidarity();
    } catch (error) {
      showError(error);
    }
  };

  // ==========================================
  // EMERGENCIAS
  // ==========================================
  const openEmergencies = () => {
    setSection('Emergencias');
    setSalesView('map');
    setSolidarityView('map');
    setShowServicesDetail(false);
    setShowPublishService(false);
    setEmergencyView('catalog');
    loadEmergencies();
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

  const submitEmergency = async (data) => {
    const images = await filesApi.resolverImagenes(data.images);
    await emergencyApi.crear({ ...data, images });
    await loadEmergencies();
    showOnMap('Emergencia');
    setEmergencyView('catalog');
  };

  const backToEmergenciesMap = () => {
    setSection('Emergencias');
    setEmergencyView('map');
    window.GeoFastPe?.setCategory('Emergencia');
  };

  // ==========================================
  // REPORTES
  // ==========================================
  const openReports = () => {
    setSection('Reportes');
    setSalesView('map');
    setSolidarityView('map');
    setEmergencyView('map');
    setShowServicesDetail(false);
    setShowPublishService(false);
    setReportsView('catalog');
    loadReports();
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

  const submitReport = async (data) => {
    const images = await filesApi.resolverImagenes(data.images);
    await reportsApi.crear({ ...data, images });
    await loadReports();
    setReportsView('catalog');
  };

  const backToReportsMap = () => {
    setSection('Reportes');
    setReportsView('map');
    window.GeoFastPe?.setCategory('Reportes');
  };

  // ==========================================
  // EVENTOS
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
    setEventsTab('proximos');
    loadEvents('proximos');
  };

  const changeEventsTab = (tab) => {
    setEventsTab(tab);
    loadEvents(tab);
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

  const submitEvent = async (data) => {
    const image = await filesApi.resolverImagen(data.image);
    await eventsApi.crear({ ...data, image });
    setEventsTab('proximos');
    await loadEvents('proximos');
    setEventsView('catalog');
  };

  const toggleParticipation = async (event) => {
    if (!isAuthenticated) {
      requireLogin();
      throw new Error('Inicia sesión para participar en el evento.');
    }
    if (event.joined) {
      await eventsApi.dejarDeParticipar(event.id);
    } else {
      await eventsApi.participar(event.id);
    }
    setSelectedEvent(await eventsApi.obtenerPorId(event.id));
    await loadEvents(eventsTab);
  };

  const backToEventsMap = () => {
    setSection('Eventos');
    setEventsView('map');
    window.GeoFastPe?.setCategory('Eventos');
  };

  // Abre Mensajes desde una publicación del radar comunitario.
  const handleMessagePublication = (publication) => {
    setSelectedMessagePublication(publication);
    setPendingConversationId(null);

    if (!isAuthenticated) {
      requireLogin('Mensajes');
      return;
    }

    setShowServicesDetail(false);
    setShowPublishService(false);
    setSalesView('map');
    setSolidarityView('map');
    setEmergencyView('map');
    setReportsView('map');
    setEventsView('map');
    setSection('Mensajes');
  };

  // ==========================================
  // CONTROL AL CERRAR SESIÓN
  // ==========================================
  useEffect(() => {
    if (!isAuthenticated) {
      setShowPublishService(false);
      setSalesView((current) => (current === 'publish' ? 'catalog' : current));
      setSolidarityView((current) => (['donate', 'request'].includes(current) ? 'catalog' : current));
      setEmergencyView((current) => (current === 'report' ? 'catalog' : current));
      setReportsView((current) => (current === 'create' ? 'catalog' : current));
      setEventsView((current) => (current === 'create' ? 'catalog' : current));

      if (PRIVATE_SECTIONS.includes(section)) {
        setSection('Inicio');
      }
    }
  }, [isAuthenticated, section]);

  // ==========================================
  // CONTROL DE VISTAS
  // ==========================================
  const showServicesPage = showServicesDetail || showPublishService;
  const showSalesPage = section === 'Ventas' && salesView !== 'map';
  const showSolidarityPage = section === 'Solidaridad' && solidarityView !== 'map';
  const showEmergencyPage = section === 'Emergencias' && emergencyView !== 'map';
  const showReportsPage = section === 'Reportes' && reportsView !== 'map';
  const showEventsPage = section === 'Eventos' && eventsView !== 'map';
  const showMessagesPage = section === 'Mensajes' && isAuthenticated;
  const showProfilePage = section === 'Mi Perfil' && isAuthenticated;
  const showConfigPage = section === 'Configuración';

  const showMapInterface = picking || (!showServicesPage && !showSalesPage && !showSolidarityPage && !showEmergencyPage
    && !showReportsPage && !showEventsPage && !showMessagesPage && !showProfilePage && !showConfigPage);

  const backButton = (onClick) => (
    <button type="button" className="publish-back" onClick={onClick} style={{ margin: '16px 0 0 32px' }}>
      <ArrowLeft size={16} /> Volver al mapa
    </button>
  );

  return (
    <main className="geofastpe-app">
      {picking && (
        <div role="status" style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 3000, background: '#7c3aed', color: '#fff', padding: '10px 14px 10px 18px', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>Haz clic en el mapa para marcar la ubicación</span>
          <button type="button" onClick={cancelPick} style={{ background: '#fff', color: '#5b21b6', border: 0, borderRadius: 8, padding: '6px 10px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
        </div>
      )}

      {notice && (
        <div role="status" onClick={() => setNotice('')} style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 3000, background: '#1e293b', color: '#fff', padding: '10px 18px', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', cursor: 'pointer', maxWidth: '90vw' }}>
          {notice}
        </div>
      )}

      {/* MAPA: no se desmonta al cambiar de vista */}
      <div className={`geofastpe-map-workspace ${showMapInterface ? '' : 'workspace-hidden'}`}>
        <MapView />
        <ConnectivityView />
        <SearchView />
        <LayerSwitcherView />
        <TransportLegendView />
        <FloatingActionsView />
        <RouteModesView />
        <WeatherView />
        <RotationView />
        <StatusToastView />
      </div>

      <div className="app-shell">
        <Sidebar section={section} onSelectSection={selectSection} onRequireLogin={requireLogin} />

        <div className={`geofastpe-panel-workspace ${showMapInterface ? '' : 'workspace-hidden'}`}>

          <SidePanel
            section={section}
            services={services}
            radius={radius}
            onRadiusChange={changeRadius}
            onLogin={openLogin}
            onRegister={openRegister}

            // Servicios
            onViewService={openServicesDetail}
            onPublishService={openPublishService}

            // Ventas
            onViewSalesCatalog={openSalesCatalog}
            onPublishSale={openPublishSale}

            // Solidaridad
            onViewSolidarity={openSolidarity}
            onPublishDonation={() => openSolidarityForm('donate')}
            onRequestHelp={() => openSolidarityForm('request')}

            // Emergencias
            onViewEmergencies={openEmergencies}
            onReportEmergency={() => openEmergencyForm()}
            emergencyReports={emergencyReports}

            // Reportes
            onViewReports={openReports}
            onCreateReport={openCreateReport}
            citizenReports={citizenReports}

            // Eventos
            onViewEvents={openEvents}
            onCreateEvent={openCreateEvent}
            communityEvents={communityEvents}
            onMessagePublication={handleMessagePublication}
          />

        
        </div>

        {showServicesPage && (
  <div
    className="geofastpe-content-workspace"
    style={{ display: picking ? 'none' : undefined }}
  >
            {showPublishService ? (
              <PublishService onBack={backToServices} onSubmit={submitService} onPickLocation={pickLocation} />
            ) : (
              <div>
                {backButton(backToMap)}
                <ServicesPage
                  services={selectedService ? [selectedService] : servicesCatalog}
                  onCreateService={openPublishService}
                  onRequireLogin={() => requireLogin(null, 'publish-service')}
                />
              </div>
            )}
          </div>
        )}

{/* SOLIDARIDAD: ocultar formulario mientras se selecciona ubicación.
    Mantener el componente montado conserva los datos ingresados.
    Aplica a donaciones y solicitudes de ayuda. */}
{showSolidarityPage && (
  <div
    className="geofastpe-content-workspace"
    style={{ display: picking ? 'none' : undefined }}
  >
            {solidarityView === 'donate' ? (
              <PublishDonation onBack={openSolidarity} onSubmitDonation={submitDonation} onPickLocation={pickLocation} />
            ) : solidarityView === 'request' ? (
              <RequestHelp onBack={openSolidarity} onSubmitRequest={submitRequest} onPickLocation={pickLocation} />
            ) : (
              <div>
                {backButton(backToSolidarityMap)}
                <SolidarityPage
                  donations={donations}
                  requests={requests}
                  onPublishDonation={() => openSolidarityForm('donate')}
                  onRequestHelp={() => openSolidarityForm('request')}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            )}
          </div>
        )}

{showEmergencyPage && (
  <div
    className="geofastpe-content-workspace"
    style={{ display: picking ? 'none' : undefined }}
  >
            {emergencyView === 'report' ? (
              <ReportEmergency initialType={emergencyType} onBack={openEmergencies} onSubmit={submitEmergency} onPickLocation={pickLocation} />
            ) : (
              <div>
                {backButton(backToEmergenciesMap)}
                <EmergencyPage reports={emergencyReports} onReport={openEmergencyForm} />
              </div>
            )}
          </div>
        )}

{/* REPORTES: mostrar mapa durante la selección del punto.
    TODO: permitir visualizar la ubicación de reportes existentes. */}
{showReportsPage && (
  <div
    className="geofastpe-content-workspace"
    style={{ display: picking ? 'none' : undefined }}
  >
            {reportsView === 'create' ? (
              <CreateReport onBack={openReports} onSubmitReport={submitReport} onPickLocation={pickLocation} />
            ) : reportsView === 'detail' ? (
              <ReportDetail report={selectedReport} onBack={openReports} />
            ) : (
              <div>
                {backButton(backToReportsMap)}
                <ReportsPage reports={citizenReports} onCreateReport={openCreateReport} onViewReport={openReportDetail} />
              </div>
            )}
          </div>
        )}

{/* ==========================================
    EVENTOS: SELECCIÓN DE UBICACIÓN EN EL MAPA

    Cuando picking es true:
    - Ocultamos temporalmente el formulario.
    - Mostramos el mapa de GeoFastPe.
    - Conservamos los datos ingresados.
    - Al seleccionar el punto, vuelve el formulario.

    TODO:
    - Mostrar una vista previa del punto elegido.
    - Permitir cambiar la ubicación.
    - Centrar el mapa en el evento publicado.
========================================== */}

{showEventsPage && (
  <div
    className="geofastpe-content-workspace"
    style={{ display: picking ? 'none' : undefined }}
  >
            {eventsView === 'create' ? (
              <CreateEvent onBack={openEvents} onSubmitEvent={submitEvent} onPickLocation={pickLocation} />
            ) : eventsView === 'detail' ? (
              <EventDetail event={selectedEvent} onBack={openEvents} onToggleParticipation={toggleParticipation} />
            ) : (
              <div>
                {backButton(backToEventsMap)}
                <EventsPage events={communityEvents} onCreateEvent={openCreateEvent} onViewEvent={openEventDetail} onTabChange={changeEventsTab} />
              </div>
            )}
          </div>
        )}

        {showMessagesPage && (
          <div className="geofastpe-content-workspace">
            <MessagesPage
              isAuthenticated={isAuthenticated}
              initialConversationId={pendingConversationId}
              initialPublication={selectedMessagePublication}
            />
          </div>
        )}

        {showProfilePage && (
          <div className="geofastpe-content-workspace">
            <ProfilePage onRequireLogin={() => requireLogin('Mi Perfil')} />
          </div>
        )}

        {showConfigPage && (
          <div className="geofastpe-content-workspace">
            <ConfigPage onRequireLogin={() => requireLogin('Configuración')} />
          </div>
        )}

{showSalesPage && (
  <div
    className="geofastpe-content-workspace"
    style={{ display: picking ? 'none' : undefined }}
  >
            {salesView === 'publish' ? (
              <PublishSale onBack={backToSales} onSubmitSale={submitSale} onPickLocation={pickLocation} />
            ) : salesView === 'detail' ? (
              <SaleDetail product={selectedSale} onBack={backToSales} onContactSeller={contactSeller} />
            ) : (
              <div>
                {backButton(backToSalesMap)}
                <SalesPage products={sales} onCreateSale={openPublishSale} onViewSale={openSaleDetail} />
              </div>
            )}
          </div>
        )}
      </div>

      {showLoginRequired && (
        <LoginRequired onClose={closeLoginRequired} onLogin={openLogin} onRegister={openRegister} />
      )}

      {authMode && (
        <AuthModal key={authMode} mode={authMode} onClose={closeAuth} onAuthenticated={handleAuthenticated} />
      )}
    </main>
  );
}
