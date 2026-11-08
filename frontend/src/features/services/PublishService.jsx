import { useState } from 'react';
import { ArrowLeft, ImagePlus, MapPin, Wrench } from 'lucide-react';
import MapPointPicker from '../../components/common/MapPointPicker.jsx';
import './PublishService.css';

const categories = ['Hogar', 'Transporte', 'Salud', 'Educación', 'Otros'];

const serviceTypes = [
  'Servicio a domicilio',
  'Servicio en local',
  'Servicio virtual',
  'Servicio mixto'
];

const availabilityOptions = [
  { value: 'weekdays', label: 'Lunes a viernes' },
  { value: 'weekends', label: 'Sábados y domingos' },
  { value: 'everyday', label: 'Todos los días' },
  { value: 'appointment', label: 'Previa coordinación' }
];

const initialForm = {
  title: '',
  category: 'Hogar',
  type: 'Servicio a domicilio',
  description: '',
  phone: '',
  address: '',
  availability: ''
};

export default function PublishService({ onBack, onSubmit, onPickLocation }) {
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [point, setPoint] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Solo se permiten imágenes JPG, PNG o WEBP.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5 MB.');
      event.target.value = '';
      return;
    }

    setError('');
    setImage(file);

    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setError('');
    setSuccess('');

    if (!point) {
      setError('Elige la ubicación del servicio haciendo clic en el mapa.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      category: form.category,
      type: form.type,
      description: form.description.trim(),
      phone: form.phone.trim(),
      locationType: 'gps',
      address: form.address.trim() || null,
      latitude: point.lat,
      longitude: point.lng,
      availability: form.availability,
      image
    };

    try {
      setBusy(true);
      await onSubmit?.(payload);
      setSuccess('Servicio publicado correctamente.');
    } catch (submitError) {
      setError(submitError.message || 'No se pudo publicar el servicio.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="publish-service-page">
      <button type="button" className="publish-back" onClick={onBack}>
        <ArrowLeft size={17} /> Volver a Servicios Locales
      </button>

      <header className="publish-heading">
        <div className="publish-heading-icon"><Wrench size={26} /></div>
        <div>
          <h1>Publicar Nuevo Servicio</h1>
          <p>Ofrece un servicio a tu comunidad.</p>
        </div>
      </header>

      <form className="publish-form" onSubmit={handleSubmit}>
        <div className="publish-field">
          <label htmlFor="service-title">Título del servicio *</label>
          <input id="service-title" name="title" value={form.title} onChange={updateField} placeholder="Ej. Electricista a domicilio" maxLength={100} required />
        </div>

        <div className="publish-two-columns">
          <div className="publish-field">
            <label htmlFor="service-category">Categoría *</label>
            <select id="service-category" name="category" value={form.category} onChange={updateField} required>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </div>

          <div className="publish-field">
            <label htmlFor="service-type">Tipo de servicio *</label>
            <select id="service-type" name="type" value={form.type} onChange={updateField} required>
              {serviceTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </div>

        <div className="publish-field">
          <label htmlFor="service-description">Descripción *</label>
          <textarea id="service-description" name="description" value={form.description} onChange={updateField} placeholder="Describe tu servicio, horarios y experiencia..." rows={5} maxLength={500} required />
          <span className="publish-counter">{form.description.length}/500</span>
        </div>

        <div className="publish-field">
          <label htmlFor="service-phone">Número de contacto *</label>
          <input id="service-phone" name="phone" type="tel" value={form.phone} onChange={updateField} placeholder="Ej. 987654321" pattern="[0-9]{9}" maxLength={9} inputMode="numeric" title="Ingresa un número de 9 dígitos" required />
        </div>

        <div className="publish-location">
          <div className="publish-location-title">
            <span><MapPin size={22} /></span>
            <div>
              <h3>Ubicación del servicio *</h3>
              <p>Haz clic en el mapa para marcar dónde prestas el servicio.</p>
            </div>
          </div>

          <MapPointPicker value={point} onPick={onPickLocation} onChange={setPoint} />

          <div className="publish-field">
            <label htmlFor="service-address">Referencia o dirección (opcional)</label>
            <input id="service-address" name="address" value={form.address} onChange={updateField} placeholder="Ej. Av. Ejército 123, Cayma" maxLength={200} />
          </div>
        </div>

        <div className="publish-field">
          <label htmlFor="service-availability">Disponibilidad *</label>
          <select id="service-availability" name="availability" value={form.availability} onChange={updateField} required>
            <option value="">Selecciona tu horario</option>
            {availabilityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>

        <div className="publish-field">
          <label htmlFor="service-image">Imagen del servicio</label>
          <label className="publish-image-upload" htmlFor="service-image">
            {preview ? (
              <img src={preview} alt="Vista previa del servicio" />
            ) : (
              <>
                <span className="publish-upload-icon"><ImagePlus size={28} /></span>
                <strong>Seleccionar imagen</strong>
                <small>JPG, PNG o WEBP, máximo 5 MB</small>
              </>
            )}
          </label>
          <input id="service-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="publish-file-input" />
        </div>

        {error && <p className="publish-message" role="alert">{error}</p>}
        {success && <p className="publish-message" role="status">{success}</p>}

        <div className="publish-actions">
          <button type="button" className="publish-cancel" onClick={onBack} disabled={busy}>Cancelar</button>
          <button type="submit" className="publish-submit" disabled={busy}>
            {busy ? 'Publicando...' : 'Publicar servicio'}
          </button>
        </div>
      </form>
    </section>
  );
}
