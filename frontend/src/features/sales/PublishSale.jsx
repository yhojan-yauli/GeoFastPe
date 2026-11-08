import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ShoppingCart,
  MapPin,
  ImagePlus,
  X,
  Upload
} from 'lucide-react';

import MapPointPicker from '../../components/common/MapPointPicker.jsx';
import './PublishSale.css';

const categories = ['Tecnología', 'Hogar', 'Moda', 'Deportes', 'Vehículos', 'Libros', 'Otros'];

const districts = [
  'Cercado',
  'Cayma',
  'Yanahuara',
  'Cerro Colorado',
  'Paucarpata',
  'José Luis Bustamante y Rivero',
  'Miraflores',
  'Mariano Melgar',
  'Sachaca',
  'Socabaya',
  'Hunter',
  'Alto Selva Alegre',
  'Tiabaya',
  'Uchumayo',
  'Otro'
];

const initialForm = {
  name: '',
  category: 'Tecnología',
  condition: 'Usado',
  price: '',
  description: '',
  location: ''
};

export default function PublishSale({ onBack, onSubmitSale, onPickLocation }) {
  const [form, setForm] = useState(initialForm);
  const [point, setPoint] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!image) {
      setImagePreview('');
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Selecciona una imagen JPG, PNG o WEBP.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5 MB.');
      event.target.value = '';
      return;
    }

    setImage(file);
    setError('');
    setSuccess('');
  };

  const removeImage = () => {
    setImage(null);
    const input = document.getElementById('sale-image');
    if (input) input.value = '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setError('');
    setSuccess('');

    const name = form.name.trim();
    const description = form.description.trim();
    const price = Number(form.price);

    if (!name) {
      setError('Ingresa el nombre del producto.');
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError('Ingresa un precio válido.');
      return;
    }

    if (!description) {
      setError('Ingresa una descripción.');
      return;
    }

    if (!form.location) {
      setError('Selecciona un distrito.');
      return;
    }

    if (!point) {
      setError('Elige la ubicación del producto haciendo clic en el mapa.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmitSale?.({
        name,
        category: form.category,
        condition: form.condition,
        price,
        description,
        location: form.location,
        lat: point.lat,
        lng: point.lng,
        image
      });
      setSuccess('La publicación fue guardada correctamente.');
    } catch (submitError) {
      setError(submitError.message || 'No se pudo procesar la publicación.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="publish-sale-page">
      <div className="publish-sale-container">
        <button type="button" className="publish-sale-back" onClick={() => onBack?.()}>
          <ArrowLeft size={18} />
          Volver a Ventas Locales
        </button>

        <div className="publish-sale-hero">
          <ShoppingCart size={34} />
          <div>
            <h1>Publicar Nueva Venta</h1>
            <p>Publica un producto para tu comunidad.</p>
          </div>
        </div>

        <form className="publish-sale-form" onSubmit={handleSubmit}>
          <div className="publish-sale-field">
            <label htmlFor="sale-name">Nombre del producto *</label>
            <input id="sale-name" name="name" type="text" maxLength={120} placeholder="Ej. Laptop Lenovo ThinkPad" value={form.name} onChange={updateField} required />
          </div>

          <div className="publish-sale-row">
            <div className="publish-sale-field">
              <label htmlFor="sale-category">Categoría *</label>
              <select id="sale-category" name="category" value={form.category} onChange={updateField} required>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="publish-sale-field">
              <label htmlFor="sale-condition">Estado del producto *</label>
              <select id="sale-condition" name="condition" value={form.condition} onChange={updateField} required>
                <option value="Nuevo">Nuevo</option>
                <option value="Usado">Usado</option>
              </select>
            </div>
          </div>

          <div className="publish-sale-field">
            <label htmlFor="sale-price">Precio de venta (S/) *</label>
            <input id="sale-price" name="price" type="number" min="0.01" step="0.01" placeholder="Ej. 350.00" value={form.price} onChange={updateField} required />
          </div>

          <div className="publish-sale-field">
            <label htmlFor="sale-description">Descripción *</label>
            <textarea id="sale-description" name="description" rows={5} maxLength={1000} placeholder="Describe el producto, sus características y condiciones..." value={form.description} onChange={updateField} required />
            <small className="publish-sale-counter">{form.description.length}/1000</small>
          </div>

          <div className="publish-sale-field">
            <label htmlFor="sale-location">
              <MapPin size={16} />
              Ubicación del producto *
            </label>
            <select id="sale-location" name="location" value={form.location} onChange={updateField} required>
              <option value="">Selecciona tu distrito</option>
              {districts.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          <div className="publish-sale-field">
            <label>Punto exacto en el mapa *</label>
            <MapPointPicker value={point} onPick={onPickLocation} onChange={setPoint} />
          </div>

          <div className="publish-sale-field">
            <label htmlFor="sale-image">Imagen del producto</label>
            <input id="sale-image" className="publish-sale-file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />

            {imagePreview ? (
              <div className="publish-sale-preview">
                <img src={imagePreview} alt="Vista previa del producto" />
                <button type="button" onClick={removeImage} aria-label="Eliminar imagen">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <label htmlFor="sale-image" className="publish-sale-upload">
                <ImagePlus size={30} />
                <strong>Seleccionar imagen</strong>
                <span>JPG, PNG o WEBP · Máximo 5 MB</span>
              </label>
            )}
          </div>

          {error && <div className="publish-sale-message error" role="alert">{error}</div>}
          {success && <div className="publish-sale-message success" role="status">{success}</div>}

          <div className="publish-sale-actions">
            <button type="button" className="publish-sale-cancel" onClick={() => onBack?.()} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="publish-sale-submit" disabled={submitting}>
              <Upload size={18} />
              {submitting ? 'Procesando...' : 'Publicar venta'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
