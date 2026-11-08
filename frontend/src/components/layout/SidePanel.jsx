
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
  onViewService
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

    // Reportes y eventos
    if (
      section === 'Reportes' ||
      section === 'Eventos'
    ) {
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
              ? `Resultados dentro de un radio de ${radius} m`
              : 'Tu espacio comunitario'}
          </p>
        </div>

        <span className="panel-count">
          {isMapSection
            ? items.length
            : '•••'}
        </span>
      </div>

      {/* =====================================
          FILTRO DE RADIO
      ===================================== */}
      {isMapSection && (
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

      {/* =====================================
          LISTADO DE PUBLICACIONES
      ===================================== */}
      <div className="panel-list">

        {items.length > 0 ? (

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

