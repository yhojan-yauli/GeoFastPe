
import { useEffect, useState } from "react";

import {
  ArrowRight,
  Ambulance,
  Building2,
  CalendarDays,
  Car,
  Flame,
  Flag,
  Gift,
  HeartHandshake,
  Hammer,
  Laptop,
  MapPin,
  Plus,
  ShoppingBag,
  Sparkles,
  Sprout,
  TriangleAlert,
  Waves,
  Wrench,
  Zap,
  Siren
} from "lucide-react";

import AuthHeader from "../../features/auth/AuthHeader.jsx";
import PublicationDetailView from "../views/PublicationDetailView.jsx";

const PRIVATE_SECTIONS = [
  "Mensajes",
  "Mi Perfil",
  "Configuración"
];

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const serviceIcon = (type) => {
  const value = normalize(type);

  if (value.includes("electric")) return Zap;
  if (value.includes("gasfiter") || value.includes("plomer"))
    return Wrench;
  if (value.includes("comput") || value.includes("tecnolog"))
    return Laptop;
  if (value.includes("limpieza")) return Sparkles;
  if (value.includes("carpinter")) return Hammer;
  if (value.includes("jardiner")) return Sprout;

  return Wrench;
};

const solidarityIcon = (point) => {
  const value = normalize(
    point.category || point.subtype || point.type
  );

  return value.includes("solicitud") ||
    value.includes("ayuda") ||
    value.includes("necesit")
    ? HeartHandshake
    : Gift;
};

const emergencyIcon = (type) => {
  const value = normalize(type);

  if (value.includes("incendio") || value.includes("fuego"))
    return Flame;
  if (value.includes("accidente") || value.includes("choque"))
    return Car;
  if (value.includes("medica") || value.includes("salud"))
    return Ambulance;
  if (value.includes("inundacion")) return Waves;
  if (value.includes("robo") || value.includes("asalto"))
    return Siren;
  if (value.includes("sismo") || value.includes("terremoto"))
    return Building2;

  return TriangleAlert;
};

const markerIconFor = (item) => {
  if (item.kind === "EMERGENCIA")
    return emergencyIcon(item.type);

  if (item.kind === "SERVICIO")
    return serviceIcon(
      item.category || item.serviceCategory || item.type
    );

  if (item.kind === "VENTA") return ShoppingBag;

  if (item.kind === "SOLIDARIDAD")
    return solidarityIcon(item);

  return MapPin;
};

const formatDistance = (distance) => {
  if (distance == null || distance === "") {
    return "Distancia no disponible";
  }

  const value = Number(distance);

  return Number.isFinite(value)
    ? `${(value / 1000).toFixed(1)} km`
    : "Distancia no disponible";
};

export default function SidePanel({
  section,
  services = [],
  radius = 1000,
  onRadiusChange,
  onLogin,
  onRegister,

  onViewService,
  onPublishService,

  onViewSalesCatalog,
  onPublishSale,

  onViewSolidarity,
  onPublishDonation,
  onRequestHelp,

  onViewEmergencies,
  onReportEmergency,
  emergencyReports = [],

  onViewReports,
  onCreateReport,
  citizenReports = [],

  onViewEvents,
  onCreateEvent,
  communityEvents = [],

  onMessagePublication,
  onSelectPublicationLocation
}) {
  const [selectedPublication, setSelectedPublication] =
    useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setSelectedPublication(null);
  }, [section]);

  const isMapSection =
    !PRIVATE_SECTIONS.includes(section);

  const showDetail = (publication) => {
    setSelectedPublication(publication);
  };

  const goBack = () => {
    setSelectedPublication(null);
  };

  const focusServiceOnMap = (item) => {
    const lat = Number(item.lat ?? item.latitude);
    const lng = Number(item.lng ?? item.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    const map = window.GeoFastPe?.getMap?.();

    map?.flyTo({
      center: [lng, lat],
      zoom: 16,
      essential: true
    });
  };

  const handleShowLocation = (publication) => {
    if (onSelectPublicationLocation) {
      onSelectPublicationLocation(publication);
    } else {
      focusServiceOnMap(publication);
    }
  };

  const handleMessage = (publication) => {
  if (typeof onMessagePublication === "function") {
    onMessagePublication(publication);
    return;
  }

  console.warn(
    "Falta configurar la navegación a Mensajes en App.jsx.",
    publication
  );
};

  const title =
    section === "Inicio"
      ? "Todo cerca de ti"
      : section === "Servicios"
      ? "Servicios cerca de ti"
      : section === "Emergencias"
      ? "Emergencias cercanas"
      : section === "Solidaridad"
      ? "Solidaridad cerca de ti"
      : section;

  const countFor = () => {
    if (section === "Emergencias")
      return emergencyReports.length;

    if (section === "Reportes")
      return citizenReports.length;

    if (section === "Eventos")
      return communityEvents.length;

    if (isMapSection)
      return services.length;

    return "—";
  };

  const renderItems = () => {
    if (!isMapSection) {
      return (
        <div className="empty-state">
          <h3>{section}</h3>
          <p>
            Usa el panel central para gestionar esta sección.
          </p>
        </div>
      );
    }

    // EMERGENCIAS
    if (section === "Emergencias") {
      if (emergencyReports.length === 0) {
        return (
          <div className="empty-state">
            <h3>No hay emergencias registradas</h3>
            <p>
              Cuando se reporte una emergencia aparecerá
              aquí. No se notifica a las autoridades
              automáticamente.
            </p>
          </div>
        );
      }

      return emergencyReports.map((report) => {
        const Icon = emergencyIcon(report.type);

        return (
          <article
            className="nearby-card"
            key={report.id}
            role="button"
            tabIndex={0}
            onClick={() =>
              showDetail({
                ...report,
                kind: "EMERGENCIA"
              })
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                showDetail({
                  ...report,
                  kind: "EMERGENCIA"
                });
              }
            }}
          >
            <div className="nearby-icon danger">
              <Icon size={22} />
            </div>

            <div className="nearby-copy">
              <h3>{report.title}</h3>
              <p>
                {report.type} · Urgencia {report.urgency}
              </p>
              <small>
                {report.locationText ||
                  "Ubicación por coordenadas"}
              </small>
            </div>

            <ArrowRight size={18} />
          </article>
        );
      });
    }

    // REPORTES
    if (section === "Reportes") {
      if (citizenReports.length === 0) {
        return (
          <div className="empty-state">
            <h3>Reportes comunitarios</h3>
            <p>
              Aún no hay reportes. Abre el listado para
              crear el primero.
            </p>
          </div>
        );
      }

      return citizenReports.map((report) => (
        <article
          className="nearby-card"
          key={report.id}
          role="button"
          tabIndex={0}
          onClick={() =>
            showDetail({
              ...report,
              kind: "REPORTE"
            })
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              showDetail({
                ...report,
                kind: "REPORTE"
              });
            }
          }}
        >
          <div className="nearby-icon purple">
            <Flag size={22} />
          </div>

          <div className="nearby-copy">
            <h3>{report.title}</h3>
            <p>
              {report.category} ·{" "}
              {report.location ||
                "Ubicación por coordenadas"}
            </p>
            <small>{report.status}</small>
          </div>

          <ArrowRight size={18} />
        </article>
      ));
    }

    // EVENTOS
    if (section === "Eventos") {
      if (communityEvents.length === 0) {
        return (
          <div className="empty-state">
            <h3>Eventos comunitarios</h3>
            <p>
              Abre el catálogo para explorar eventos o
              publicar una actividad.
            </p>
          </div>
        );
      }

      return communityEvents.map((event) => (
        <article
          className="nearby-card"
          key={event.id}
          role="button"
          tabIndex={0}
          onClick={() =>
            showDetail({
              ...event,
              kind: "EVENTO"
            })
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              showDetail({
                ...event,
                kind: "EVENTO"
              });
            }
          }}
        >
          <div className="nearby-icon purple">
            <CalendarDays size={22} />
          </div>

          <div className="nearby-copy">
            <h3>{event.title}</h3>
            <p>
              {event.category} · {event.date} ·{" "}
              {event.time}
            </p>
            <small>{event.location}</small>
          </div>

          <ArrowRight size={18} />
        </article>
      ));
    }

    // PUBLICACIONES CERCANAS
    if (services.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-symbol">
            <MapPin size={34} />
          </div>

          <h3>No hay resultados en esta zona</h3>

          <p>
            Amplía el radio o cambia de ubicación para
            encontrar más elementos.
          </p>
        </div>
      );
    }

    return services.map((item, index) => {
      const isService =
        item.kind === "SERVICIO" &&
        section === "Servicios";

      const isSale = item.kind === "VENTA";

      const isSolidarity =
        item.kind === "SOLIDARIDAD";

      const MarkerIcon = markerIconFor(item);

      const iconClass =
        item.kind === "EMERGENCIA"
          ? "danger"
          : item.kind === "SERVICIO"
          ? "service-icon"
          : isSale
          ? "sale"
          : isSolidarity
          ? "purple"
          : "";

      return (
        <article
          className="nearby-card"
          key={`${item.kind}-${item.id ?? index}`}
          role="button"
          tabIndex={0}
          onClick={() => showDetail(item)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              showDetail(item);
            }
          }}
        >
          <div
            className={`nearby-icon ${iconClass}`}
            style={
              isSale
                ? {
                    background: "#fff7ed",
                    color: "#ea580c"
                  }
                : undefined
            }
          >
            <MarkerIcon size={22} />
          </div>

          <div className="nearby-copy">
            <h3>{item.title}</h3>

            <p>
              {item.type || "Punto"} ·{" "}
              {formatDistance(item.distance)}
            </p>

            {isService && (
              <small className="rating">
                Ver información del servicio
              </small>
            )}

            {isSale && (
              <small>
                Selecciona para ver el producto
              </small>
            )}

            {isSolidarity && (
              <small>
                Selecciona para ver la publicación
              </small>
            )}
          </div>

          <button
            type="button"
            className="card-arrow"
            aria-label={`Ver detalle de ${item.title}`}
            onClick={(event) => {
              event.stopPropagation();
              showDetail(item);
            }}
          >
            <ArrowRight size={18} />
          </button>
        </article>
      );
    });
  };

  return (
    <aside className={`right-panel ${collapsed ? "collapsed" : ""}`}>
      <button type="button" className="gf-panel-toggle" onClick={() => setCollapsed(v => !v)} aria-label={collapsed ? "Mostrar panel" : "Ocultar panel"}>{collapsed ? <ArrowRight size={18} /> : <ArrowRight size={18} style={{ transform: "rotate(180deg)" }} />}</button>
      {selectedPublication ? (
        <PublicationDetailView
          publication={selectedPublication}
          onBack={goBack}
          onMessage={handleMessage}
          onShowLocation={handleShowLocation}
        />
      ) : (
        <>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                {isMapSection
                  ? "RADAR COMUNITARIO"
                  : "GEOFASTPE · CUENTA"}
              </span>

              <h2>{title}</h2>

              <p>
                {isMapSection
                  ? `Resultados dentro de un radio de ${radius} m`
                  : "Tu espacio comunitario"}
              </p>
            </div>

            <span className="panel-count">
              {countFor()}
            </span>
          </div>

          {isMapSection &&
            section !== "Emergencias" && (
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
                  onChange={(event) =>
                    onRadiusChange?.(
                      Number(event.target.value)
                    )
                  }
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

          {/* EMERGENCIAS */}
          {section === "Emergencias" && (
            <div className="radius-filter">
              <p>
                Consulta las alertas registradas.
                No se notifica a las autoridades
                automáticamente.
              </p>

              <button
                type="button"
                className="publish-back"
                onClick={() =>
                  onViewEmergencies?.()
                }
              >
                Ver Emergencias (SOS)
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* EVENTOS */}
          {section === "Eventos" && (
            <div className="radius-filter">
              <p>
                Explora los eventos comunitarios
                publicados por tu comunidad.
              </p>

              <button
                type="button"
                className="publish-back"
                onClick={() => onViewEvents?.()}
              >
                Ver Eventos Comunitarios
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* REPORTES */}
          {section === "Reportes" && (
            <div className="radius-filter">
              <p>
                Consulta incidencias comunitarias
                y crea reportes.
              </p>

              <button
                type="button"
                className="publish-back"
                onClick={() => onViewReports?.()}
              >
                Ver Reportes Comunitarios
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* VENTAS */}
          {section === "Ventas" && (
            <>
              <div className="service-publish-section">
                <button
                  type="button"
                  className="service-publish-button"
                  onClick={() => onPublishSale?.()}
                >
                  <Plus size={17} />
                  Publicar venta
                </button>

                <small>
                  Vende productos a tu comunidad.
                </small>
              </div>

              <div className="radius-filter">
                <p>
                  Explora los productos publicados
                  por tu comunidad.
                </p>

                <button
                  type="button"
                  className="publish-back"
                  onClick={() =>
                    onViewSalesCatalog?.()
                  }
                >
                  Ver Ventas Locales
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}

          {/* SOLIDARIDAD */}
          {section === "Solidaridad" && (
            <>
              <div className="service-publish-section">
                <button
                  type="button"
                  className="service-publish-button"
                  onClick={() =>
                    onPublishDonation?.()
                  }
                >
                  <Plus size={17} />
                  Publicar donación
                </button>

                <button
                  type="button"
                  className="publish-back"
                  onClick={() =>
                    onRequestHelp?.()
                  }
                >
                  Solicitar ayuda
                </button>

                <small>
                  Comparte recursos o solicita
                  apoyo comunitario.
                </small>
              </div>

              <div className="radius-filter">
                <p>
                  Consulta las donaciones y solicitudes
                  de ayuda de la comunidad.
                </p>

                <button
                  type="button"
                  className="publish-back"
                  onClick={() =>
                    onViewSolidarity?.()
                  }
                >
                  Ver Solidaridad y Donaciones
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}

          {/* REPORTAR EMERGENCIA */}
          {section === "Emergencias" && (
            <div className="service-publish-section">
              <button
                type="button"
                className="service-publish-button"
                onClick={() =>
                  onReportEmergency?.()
                }
              >
                <Plus size={17} />
                Reportar emergencia
              </button>

              <small>
                Registra una alerta para informar
                a la comunidad.
              </small>
            </div>
          )}

          {/* CREAR REPORTE */}
          {section === "Reportes" && (
            <div className="service-publish-section">
              <button
                type="button"
                className="service-publish-button"
                onClick={() =>
                  onCreateReport?.()
                }
              >
                <Plus size={17} />
                Crear reporte
              </button>

              <small>
                Informa sobre problemas de tu comunidad.
              </small>
            </div>
          )}

          {/* CREAR EVENTO */}
          {section === "Eventos" && (
            <div className="service-publish-section">
              <button
                type="button"
                className="service-publish-button"
                onClick={() =>
                  onCreateEvent?.()
                }
              >
                <Plus size={17} />
                Crear evento
              </button>

              <small>
                Organiza actividades para tu comunidad.
              </small>
            </div>
          )}

          {/* PUBLICAR SERVICIO */}
          {section === "Servicios" && (
            <div className="service-publish-section">
              <button
                type="button"
                className="service-publish-button"
                onClick={() =>
                  onPublishService?.()
                }
              >
                <Plus size={17} />
                Publicar servicio
              </button>

              <small>
                Ofrece tus servicios a los vecinos
                de tu comunidad.
              </small>
            </div>
          )}

          {/* LISTADO DEL RADAR */}
          <div className="panel-list">
            {renderItems()}
          </div>

          {/* AUTENTICACIÓN */}
          <div className="panel-auth-section">
            <AuthHeader
              onLogin={onLogin}
              onRegister={onRegister}
            />
          </div>

          {/* ESTADO DEL PANEL */}
          <div className="panel-footer">
            <span className="live-dot" />

            {isMapSection
              ? "Actualizado según el área visible"
              : "Datos en tiempo real desde el servidor"}
          </div>
        </>
      )}
    </aside>
  );
}
