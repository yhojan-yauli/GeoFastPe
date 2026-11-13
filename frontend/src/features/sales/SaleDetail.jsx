import { useState } from 'react';
import {
  ArrowLeft,
  ShoppingCart,
  MapPin,
  Tag,
  PackageCheck,
  MessageCircle,
  Route,
  ImageOff
} from 'lucide-react';

import { usePreferences } from '../../preferences/PreferencesContext.jsx';
import './SaleDetail.css';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(Number(price) || 0);

export default function SaleDetail({ product, onBack, onContactSeller, onShowMap }) {
  const { tr } = usePreferences();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const routeToSale = () => {
    const api = window.GeoFastPe;
    if (!api) return;
    const lat = Number(product?.lat ?? product?.latitude);
    const lng = Number(product?.lng ?? product?.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) api.routeToCoordinates?.(lat, lng, product?.name || 'Destino');
    else if (product?.location) api.routeTo?.(product.location);
    onShowMap?.();
  };

  if (!product) {
    return (
      <section className="sale-detail-page">
        <div className="sale-detail-container">
          <button type="button" className="sale-detail-back" onClick={() => onBack?.()}>
            <ArrowLeft size={18} />
            {tr('Volver a Ventas Locales')}
          </button>

          <div className="sale-detail-empty">
            <ShoppingCart size={42} />
            <h2>{tr('Producto no disponible')}</h2>
            <p>{tr('No se encontró la publicación seleccionada.')}</p>
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
          {tr('Volver a Ventas Locales')}
        </button>

        <div className="sale-detail-hero">
          <ShoppingCart size={30} />
          <div>
            <h1>{tr('Detalle del producto')}</h1>
            <p>{tr('Conoce más sobre esta publicación de tu comunidad.')}</p>
          </div>
        </div>

        <div className="sale-detail-card">
          <div className="sale-detail-image">
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <div className="sale-detail-no-image">
                <ImageOff size={42} />
                <span>{tr('Sin imagen disponible')}</span>
              </div>
            )}
          </div>

          <div className="sale-detail-info">
            <span className="sale-detail-category">{product.category ? tr(product.category) : tr('Otros')}</span>
            <h2>{product.name}</h2>
            <strong className="sale-detail-price">{formatPrice(product.price)}</strong>

            <div className="sale-detail-metadata">
              <div>
                <MapPin size={18} />
                <span>{product.location || tr('Ubicación no disponible')}</span>
              </div>
              <div>
                <Tag size={18} />
                <span>{product.category ? tr(product.category) : tr('Otros')}</span>
              </div>
              <div>
                <PackageCheck size={18} />
                <span>{tr('Estado')}: {product.condition ? tr(product.condition) : tr('No especificado')} · {product.status ? tr(product.status) : tr('Disponible')}</span>
              </div>
            </div>

            <div className="sale-detail-description">
              <h3>{tr('Descripción del producto')}</h3>
              <p>{product.description || tr('El vendedor todavía no ha agregado una descripción.')}</p>
            </div>

            <button type="button" className="sale-detail-contact" onClick={handleContact} disabled={busy || !onContactSeller}>
              <MessageCircle size={19} />
              {busy ? tr('Abriendo conversación...') : tr('Contactar al vendedor')}
            </button>

            <button type="button" className="sale-detail-contact" onClick={routeToSale} style={{ marginTop: 8 }}>
              <Route size={19} />
              {tr('Cómo llegar')}
            </button>

            {error && <p className="sale-detail-contact-note" role="alert">{tr(error)}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
