import { useMemo } from 'react';
import AuthHeader from '../../features/auth/AuthHeader.jsx';

// ==========================================
// PLANTILLAS DE OTRAS SECCIONES
// ==========================================
const templates = {
  Reportes: [
    {
      title: 'Nuevo reporte ciudadano',
      detail: 'Describe una incidencia en tu zona',
      action: 'Crear reporte'
    },
    {
      title: 'Mis reportes',
      detail: 'Consulta el estado de tus reportes',
      action: 'Ver reportes'
    }
  ],

  Eventos: [
    {
      title: 'Eventos cercanos',
      detail: 'Actividades y convocatorias dentro del área',
      action: 'Explorar eventos'
    },
    {
      title: 'Publicar evento',
      detail: 'Comparte una actividad con tu comunidad',
      action: 'Crear evento'
    }
  ],

  Mensajes: [
    {
      title: 'Bandeja de entrada',
      detail: 'Tus conversaciones aparecerán aquí',
      action: 'Abrir mensajes'
    },
    {
      title: 'Solicitudes',
      detail: 'Mensajes de nuevos contactos',
      action: 'Ver solicitudes'
    }
  ],

  'Mi Perfil': [
    {
      title: 'Información personal',
      detail: 'Administra tus datos y foto de perfil',
      action: 'Editar perfil'
    },
    {
      title: 'Actividad',
      detail: 'Historial de publicaciones y solicitudes',
      action: 'Ver actividad'
    }
  ],

  'Configuración': [
    {
      title: 'Preferencias',
      detail: 'Notificaciones, privacidad y accesibilidad',
      action: 'Administrar'
    },
    {
      title: 'Cuenta y seguridad',
      detail: 'Contraseña y sesiones activas',
      action: 'Configurar cuenta'
    }
  ]
};

// ==========================================
// ICONOS SEGÚN EL TIPO DE PUBLICACIÓN
// ==========================================
const iconFor = (type) => {
  if (type === 'Emergencia') return '!';
  if (type === 'Solidaridad') return '♥';
  return '⌂';
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function SidePanel({
  section,
  services = [],
  radius,
  onRadiusChange,
  onLogin,
  onRegister,
  onViewService,
  onViewSalesCatalog,
  onViewSolidarity,
  onViewEmergencies,
  emergencyReports = [],
  onViewReports,
  onViewEvents,
  communityEvents = [],
  citizenReports = []
}) {

  // ==========================================
  // IDENTIFICAR SECCIONES DEL MAPA
  // ==========================================
  const isMapSection = ![
    'Mensajes',
    'Mi Perfil',
    'Configuración'
  ].includes(section);

  // ==========================================
  // PREPARAR PUBLICACIONES
  // ==========================================
  const items = useMemo(() => {

    // Secciones privadas
    if (!isMapSection) {
      return templates[section] || [];
    }

    if (['Ventas', 'Solidaridad', 'Emergencias', 'Reportes', 'Eventos'].includes(section)) return [];

    // Eventos y otras plantillas
    if (section === 'Eventos') {
      return templates[section] || [];
    }

    // Publicaciones filtradas por el motor del mapa
    return services.map((service) => {

      const distance = Number(service.distance);

      const distanceText = Number.isFinite(distance)
        ? `${(distance / 1000).toFixed(1)} km`
        : 'Distancia no disponible';

      return {
        ...service,
        detail: `${service.type || 'Servicio'} · ${distanceText}`,
        action: 'Ver detalle'
      };
    });

  }, [section, services, isMapSection]);

  // ==========================================
  // TÍTULO DEL PANEL
  // ==========================================
  const title =
    section === 'Inicio'
      ? 'Todo cerca de ti'
      : section === 'Servicios'
      ? 'Servicios cerca de ti'
      : section === 'Emergencias'
      ? 'Emergencias cercanas'
      : section === 'Solidaridad'
      ? 'Red de solidaridad'
      : section;

  // ==========================================
  // ABRIR DETALLE DE UN SERVICIO
  // ==========================================
  const handleViewService = (item) => {

    // Solo las publicaciones de Servicios
    // abren la página Servicios Locales.
    if (section !== 'Servicios') {
      return;
    }

    if (typeof onViewService === 'function') {
      onViewService(item);
    }
  };

  // ==========================================
  // INTERFAZ
  // ==========================================
  return (
    <aside className="right-panel">

      {/* =====================================
          ENCABEZADO
      ===================================== */}
      <div className="panel-heading">
        <div>
          <span className="eyebrow">
            {isMapSection
              ? 'RADAR COMUNITARIO'
              : 'GEOFASTPE · CUENTA'}
          </span>

          <h2>{title}</h2>

          <p>
            {isMapSection
              ? section === 'Emergencias' ? 'Reportes SOS de demostración' : `Resultados dentro de un radio de ${radius} m`
              : 'Tu espacio comunitario'}
          </p>
        </div>

        <span className="panel-count">
          {isMapSection
            ? section === 'Emergencias' ? emergencyReports.length : section === 'Reportes' ? citizenReports.length : section === 'Eventos' ? communityEvents.length : items.length
            : '•••'}
        </span>
      </div>

      {/* =====================================
          FILTRO DE RADIO
      ===================================== */}
      {isMapSection && section !== 'Emergencias' && (
        <div className="radius-filter">

          <div className="filter-label">
            <span>Radio de búsqueda</span>
            <strong>{radius} m</strong>
          </div>

          <input
            aria-label="Radio de búsqueda"
            type="range"
            min="500"
            max="5000"
            step="500"
            value={radius}
            onChange={(event) => {
              onRadiusChange(
                Number(event.target.value)
              );
            }}
          />

          <div className="range-ends">
            <span>500 m</span>
            <span>5 km</span>
          </div>

          <div className="filter-note">
            El listado y los marcadores se limitan
            a la zona circular del mapa.
          </div>

        </div>
      )}

      {section === 'Emergencias' && (
        <div className="radius-filter">
          <p>Consulta y registra alertas de emergencia en modo demostración. No se notifica a las autoridades automáticamente.</p>
          <button type="button" className="publish-back" onClick={() => onViewEmergencies?.()}>
            Ver Emergencias (SOS) ›
          </button>
        </div>
      )}

      {section === 'Eventos' && (
        <div className="radius-filter">
          <p>Explora eventos comunitarios de demostración y consulta las actividades publicadas.</p>
          <button type="button" className="publish-back" onClick={() => onViewEvents?.()}>
            Ver Eventos Comunitarios ›
          </button>
        </div>
      )}

      {section === 'Reportes' && (
        <div className="radius-filter">
          <p>Consulta incidencias comunitarias y crea reportes. Los ejemplos no representan incidencias verificadas.</p>
          <button type="button" className="publish-back" onClick={() => onViewReports?.()}>
            Ver Reportes Comunitarios ›
          </button>
        </div>
      )}

      {section === 'Solidaridad' && (
        <div className="radius-filter">
          <p>Consulta las donaciones y solicitudes de ayuda de la comunidad. Las publicaciones de demostración aún no están geolocalizadas.</p>
          <button
            type="button"
            className="publish-back"
            onClick={() => onViewSolidarity?.()}
          >
            Ver Solidaridad y Donaciones ›
          </button>
        </div>
      )}

      {section === 'Ventas' && (
        <div className="radius-filter">
          <p>Explora el catálogo de Ventas Locales. Las publicaciones de prueba todavía no tienen ubicación geográfica validada.</p>
          <button
            type="button"
            className="publish-back"
            onClick={() => onViewSalesCatalog?.()}
          >
            Ver Ventas Locales ›
          </button>
        </div>
      )}

      {/* =====================================
          LISTADO DE PUBLICACIONES
      ===================================== */}
      <div className="panel-list">

        {section === 'Eventos' ? (
          communityEvents.length ? communityEvents.map((event, index) => (
            <article className="nearby-card" key={event.id ?? index}>
              <div className="nearby-icon purple">▦</div>
              <div className="nearby-copy">
                <h3>{event.title}</h3>
                <p>{event.category} · {event.date} · {event.time}</p>
                <small>{event.location}</small>
              </div>
              <button type="button" className="card-arrow" onClick={() => onViewEvents?.()} title="Ver eventos">›</button>
            </article>
          )) : (
            <div className="empty-state"><h3>Eventos comunitarios</h3><p>Abre el catálogo para explorar eventos de demostración o publicar una actividad.</p></div>
          )
        ) : section === 'Reportes' ? (
          citizenReports.length === 0 ? (
            <div className="empty-state"><h3>Reportes comunitarios</h3><p>Abre el listado para explorar ejemplos o crear un reporte.</p></div>
          ) : (
            citizenReports.map((report, index) => (
              <article className="nearby-card" key={report.id ?? index}>
                <div className="nearby-icon purple">⚑</div>
                <div className="nearby-copy">
                  <h3>{report.title}</h3>
                  <p>{report.category} · {report.location}</p>
                  <small>Reporte local · {report.status || 'Pendiente'}</small>
                </div>
              </article>
            ))
          )
        ) : section === 'Emergencias' ? (
          emergencyReports.length === 0 ? (
            <div className="empty-state">
              <h3>No hay emergencias registradas</h3>
              <p>Los reportes de demostración aparecerán aquí. No se notifican a las autoridades.</p>
            </div>
          ) : (
            emergencyReports.map((report, index) => (
              <article className="nearby-card" key={report.id ?? index}>
                <div className="nearby-icon danger">!</div>
                <div className="nearby-copy">
                  <h3>{report.title || report.titulo || 'Emergencia reportada'}</h3>
                  <p>{report.type || report.tipo || 'Emergencia'} · {report.urgency || report.urgencia || 'Urgencia no indicada'}</p>
                  <small>Reporte de demostración · No enviado a autoridades</small>
                </div>
              </article>
            ))
          )
        ) : section === 'Solidaridad' ? (
          <div className="empty-state"><h3>Donaciones y solicitudes</h3><p>Abre Solidaridad para explorar las publicaciones de demostración.</p></div>
        ) : section === 'Ventas' ? (
          <div className="empty-state"><h3>Catálogo disponible</h3><p>Abre Ventas Locales para consultar productos.</p></div>
        ) : items.length > 0 ? (

          items.map((item, index) => {

            const isService =
              section === 'Servicios';

            return (
              <article
                className="nearby-card"
                key={`${item.id ?? item.title ?? item.name}-${index}`}
              >

                {/* ICONO */}
                <div
                  className={`nearby-icon ${
                    item.type === 'Emergencia'
                      ? 'danger'
                      : item.type === 'Solidaridad'
                      ? 'purple'
                      : ''
                  }`}
                >
                  {item.type
                    ? iconFor(item.type)
                    : ['▤', '▦', '✉', '♙', '⚙'][
                        index % 5
                      ]}
                </div>

                {/* INFORMACIÓN */}
                <div className="nearby-copy">

                  <h3>
                    {item.name || item.title}
                  </h3>

                  <p>{item.detail}</p>

                  {item.rating != null && (
                    <small className="rating">
                      ★ {Number(item.rating).toFixed(1)}
                    </small>
                  )}

                  {/* ETIQUETA PARA SERVICIOS */}
                  {isService && (
                    <small
                      style={{
                        display: 'block',
                        marginTop: '6px',
                        color: '#7626ed',
                        fontWeight: 600
                      }}
                    >
                      Ver información del servicio
                    </small>
                  )}

                </div>

                {/* =================================
                    BOTÓN PARA ABRIR EL SERVICIO
                ================================= */}
                <button
                  type="button"
                  className="card-arrow"
                  aria-label={
                    isService
                      ? `Ver detalle de ${
                          item.name || item.title
                        }`
                      : `Abrir ${
                          item.name || item.title
                        }`
                  }
                  title={
                    isService
                      ? 'Ver detalle del servicio'
                      : item.action
                  }
                  onClick={() => {
                    handleViewService(item);
                  }}
                  disabled={!isService}
                >
                  ›
                </button>

              </article>
            );
          })

        ) : (

          <div className="empty-state">
            <div className="empty-symbol">
              ⌖
            </div>

            <h3>
              No hay resultados en esta zona
            </h3>

            <p>
              Amplía el radio o cambia de ubicación
              para encontrar más elementos.
            </p>
          </div>

        )}

      </div>

      {/* =====================================
          AUTENTICACIÓN
          SE MANTIENE EN EL PANEL DERECHO
      ===================================== */}
      <div className="panel-auth-section">
        <AuthHeader
          onLogin={onLogin}
          onRegister={onRegister}
        />
      </div>

      {/* =====================================
          PIE DEL PANEL
      ===================================== */}
      <div className="panel-footer">
        <span className="live-dot" />

        {isMapSection
          ? 'Actualizado según el área visible'
          : 'Plantilla de interfaz · lista para conectar'}
      </div>

    </aside>
  );
}
