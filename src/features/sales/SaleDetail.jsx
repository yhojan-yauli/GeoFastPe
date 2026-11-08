import { useState } from 'react';
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

export default function SaleDetail({ product, onBack, onContactSeller }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!product) {
    return (
      <section className="sale-detail-page">
        <div className="sale-detail-container">
          <button type="button" className="sale-detail-back" onClick={() => onBack?.()}>
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

  const handleContact = async () => {
    setBusy(true);
    setError('');
    try {
      await onContactSeller?.(product);
    } catch (contactError) {
      setError(contactError.message || 'No se pudo abrir la conversación.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="sale-detail-page">
      <div className="sale-detail-container">
        <button type="button" className="sale-detail-back" onClick={() => onBack?.()}>
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
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <div className="sale-detail-no-image">
                <ImageOff size={42} />
                <span>Sin imagen disponible</span>
              </div>
            )}
          </div>

          <div className="sale-detail-info">
            <span className="sale-detail-category">{product.category || 'Otros'}</span>
            <h2>{product.name}</h2>
            <strong className="sale-detail-price">{formatPrice(product.price)}</strong>

            <div className="sale-detail-metadata">
              <div>
                <MapPin size={18} />
                <span>{product.location || 'Ubicación no disponible'}</span>
              </div>
              <div>
                <Tag size={18} />
                <span>{product.category || 'Otros'}</span>
              </div>
              <div>
                <PackageCheck size={18} />
                <span>Estado: {product.condition || 'No especificado'} · {product.status || 'Disponible'}</span>
              </div>
            </div>

            <div className="sale-detail-description">
              <h3>Descripción del producto</h3>
              <p>{product.description || 'El vendedor todavía no ha agregado una descripción.'}</p>
            </div>

            <button type="button" className="sale-detail-contact" onClick={handleContact} disabled={busy || !onContactSeller}>
              <MessageCircle size={19} />
              {busy ? 'Abriendo conversación...' : 'Contactar al vendedor'}
            </button>

            {error && <p className="sale-detail-contact-note" role="alert">{error}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
