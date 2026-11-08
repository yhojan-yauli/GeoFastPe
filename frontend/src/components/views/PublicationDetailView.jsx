
import {
  ArrowLeft,
  Wrench,
  Flame,
  ShoppingBag,
  HeartHandshake,
  TriangleAlert,
  CalendarDays,
  Flag,
  MapPin,
  UserRound,
  BadgeCheck,
  MessageCircle,
  Navigation,
  Star
} from "lucide-react";

import "./PublicationDetailView.css";

export default function PublicationDetailView({
  publication,
  onBack,
  onMessage,
  onShowLocation
}) {
  if (!publication) return null;

  const title =
    publication.title ||
    publication.titulo ||
    publication.name ||
    "Publicación comunitaria";

  const description =
    publication.description ||
    publication.descripcion ||
    publication.details ||
    "El publicador no agregó una descripción.";

  const kind = publication.kind || "";

  const category =
    publication.category ||
    publication.categoria ||
    publication.type ||
    publication.tipo ||
    kind ||
    "Comunidad";

  const location =
    publication.locationText ||
    publication.location ||
    publication.ubicacion ||
    publication.address ||
    publication.direccion ||
    "Ubicación no especificada";

  const author =
    publication.author ||
    publication.publisher ||
    publication.user ||
    {};

  const authorName =
    publication.authorName ||
    publication.publisherName ||
    publication.userName ||
    publication.nombreUsuario ||
    author.name ||
    author.nombre ||
    "Publicador no identificado";

  const avatar =
    publication.authorAvatar ||
    author.avatar ||
    author.photo ||
    "";

  const verified =
    publication.verified === true ||
    author.verified === true;

  const rating =
    publication.rating ?? author.rating;

  const image =
    publication.image ||
    publication.imagen ||
    publication.imageUrl ||
    "";

  const date =
    publication.createdAt ||
    publication.fechaPublicacion ||
    publication.created_at;

  const distance = Number(publication.distance);

  const distanceText = Number.isFinite(distance)
    ? `${(distance / 1000).toFixed(1)} km`
    : null;

  const Icon =
    kind === "EMERGENCIA" ? Flame :
    kind === "VENTA" ? ShoppingBag :
    kind === "SOLIDARIDAD" ? HeartHandshake :
    kind === "REPORTE" ? Flag :
    kind === "EVENTO" ? CalendarDays :
    kind === "SERVICIO" ? Wrench :
    TriangleAlert;

  const dateText = date
    ? new Date(date).toLocaleString("es-PE", {
        dateStyle: "medium",
        timeStyle: "short"
      })
    : "No especificada";

  return (
    <div className="gfp-detail">
      <header className="gfp-detail-header">
        <button type="button" onClick={onBack}>
          <ArrowLeft size={19} />
          Volver al radar comunitario
        </button>
      </header>

      <div className="gfp-detail-body">
        <div className="gfp-detail-heading">
          <div className="gfp-detail-icon">
            <Icon size={35} />
          </div>

          <div>
            <h2>{title}</h2>

            <div className="gfp-detail-badges">
              <span className="gfp-category">
                {category}
              </span>

              {kind === "SERVICIO" &&
                publication.available !== false && (
                  <span className="gfp-available">
                    <BadgeCheck size={15} />
                    Disponible
                  </span>
                )}
            </div>

            <p>
              {distanceText
                ? `A ${distanceText} de ti`
                : "Publicación comunitaria"}
            </p>
          </div>
        </div>

        {image ? (
          <img
            className="gfp-detail-image"
            src={image}
            alt={title}
          />
        ) : (
          <div className="gfp-detail-placeholder">
            <Icon size={46} />
            <span>Sin imagen de publicación</span>
          </div>
        )}

        <section className="gfp-detail-section">
          <h3>Descripción</h3>
          <p>{description}</p>
        </section>

        <div className="gfp-detail-information">
          <div>
            <MapPin size={18} />
            <strong>Ubicación</strong>
            <span>{location}</span>

            <button
              type="button"
              onClick={() => onShowLocation?.(publication)}
              title="Ubicar en el mapa"
            >
              <Navigation size={17} />
            </button>
          </div>

          <div>
            <CalendarDays size={18} />
            <strong>Publicado</strong>
            <span>{dateText}</span>
          </div>

          <div>
            <Flag size={18} />
            <strong>Tipo</strong>
            <span>{category}</span>
          </div>
        </div>

        <section className="gfp-detail-author">
          <h3>
            <UserRound size={20} />
            Publicado por
          </h3>

          <div className="gfp-detail-author-card">
            {avatar ? (
              <img src={avatar} alt={authorName} />
            ) : (
              <div className="gfp-detail-avatar">
                <UserRound size={25} />
              </div>
            )}

            <div className="gfp-detail-author-copy">
              <strong>{authorName}</strong>
              <span>Vecino de la comunidad</span>

              {verified && (
                <small>
                  <BadgeCheck size={15} />
                  Cuenta verificada
                </small>
              )}
            </div>

            {rating != null && (
              <div className="gfp-detail-rating">
                <Star
                  size={16}
                  fill="#f59e0b"
                  color="#f59e0b"
                />
                {rating}
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="gfp-detail-footer">
        <button
          type="button"
          onClick={() => onMessage?.(publication)}
        >
          <MessageCircle size={23} />
          Enviar mensaje
        </button>

        <p>
          Inicia una conversación directa con el publicador
        </p>
      </footer>
    </div>
  );
}
