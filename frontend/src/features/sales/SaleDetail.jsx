
import {
  ArrowLeft,
  ShoppingCart,
  MapPin,
  Tag,
  PackageCheck,
  MessageCircle,
  ImageOff
} from 'lucide-react';

import './SaleDetail.css';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(Number(price) || 0);

export default function SaleDetail({
  product,
  onBack,
  onContactSeller
}) {
  if (!product) {
    return (
      <section className="sale-detail-page">
        <div className="sale-detail-container">
          <button
            type="button"
            className="sale-detail-back"
            onClick={() => onBack?.()}
          >
            <ArrowLeft size={18} />
            Volver a Ventas Locales
          </button>

          <div className="sale-detail-empty">
            <ShoppingCart size={42} />
            <h2>Producto no disponible</h2>
            <p>No se encontró la publicación seleccionada.</p>
          </div>
        </div>
      </section>
    );
  }

  const name = product.name || product.title || 'Producto';
  const image = product.image || product.imageUrl;
  const location = product.location || 'Ubicación no disponible';
  const description = product.description ||
    'El vendedor todavía no ha agregado una descripción.';

  return (
    <section className="sale-detail-page">
      <div className="sale-detail-container">

        <button
          type="button"
          className="sale-detail-back"
          onClick={() => onBack?.()}
        >
          <ArrowLeft size={18} />
          Volver a Ventas Locales
        </button>

        <div className="sale-detail-hero">
          <ShoppingCart size={30} />
          <div>
            <h1>Detalle del producto</h1>
            <p>Conoce más sobre esta publicación de tu comunidad.</p>
          </div>
        </div>

        <div className="sale-detail-card">

          <div className="sale-detail-image">
            {image ? (
              <img src={image} alt={name} />
            ) : (
              <div className="sale-detail-no-image">
                <ImageOff size={42} />
                <span>Sin imagen disponible</span>
              </div>
            )}
          </div>

          <div className="sale-detail-info">
            <span className="sale-detail-category">
              {product.category || 'Otros'}
            </span>

            <h2>{name}</h2>

            <strong className="sale-detail-price">
              {formatPrice(product.price)}
            </strong>

            <div className="sale-detail-metadata">
              <div>
                <MapPin size={18} />
                <span>{location}</span>
              </div>

              <div>
                <Tag size={18} />
                <span>{product.category || 'Otros'}</span>
              </div>

              <div>
                <PackageCheck size={18} />
                <span>
                  Estado: {product.condition || 'No especificado'}
                </span>
              </div>
            </div>

            <div className="sale-detail-description">
              <h3>Descripción del producto</h3>
              <p>{description}</p>
            </div>

            <button
              type="button"
              className="sale-detail-contact"
              onClick={() => onContactSeller?.(product)}
              disabled={!onContactSeller}
            >
              <MessageCircle size={19} />
              Contactar al vendedor
            </button>

            {!onContactSeller && (
              <p className="sale-detail-contact-note">
                El contacto estará disponible cuando integremos
                el módulo de mensajes.
              </p>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
