
import { useState } from 'react';
import './PublishService.css';

const categories = [
  'Hogar',
  'Transporte',
  'Salud',
  'Educación',
  'Otros'
];

const serviceTypes = [
  'Servicio a domicilio',
  'Servicio en local',
  'Servicio virtual',
  'Servicio mixto'
];

const initialForm = {
  title: '',
  category: 'Hogar',
  type: 'Servicio a domicilio',
  description: '',
  phone: '',
  locationType: 'gps',
  address: '',
  availability: ''
};

export default function PublishService({ onBack }) {
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState('');

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const selectLocationType = (type) => {
    setCoordinates(null);
    setError('');

    setForm((previous) => ({
      ...previous,
      locationType: type
    }));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no admite geolocalización.');
      return;
    }

    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => {
        setError(
          'No se pudo obtener tu ubicación. Revisa los permisos del navegador.'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000
      }
    );
  };

  const handleImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png'];

    if (!validTypes.includes(file.type)) {
      setError('Solo se permiten imágenes JPG o PNG.');
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

    reader.onload = () => {
      setPreview(String(reader.result));
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (form.locationType === 'gps' && !coordinates) {
      setError('Primero selecciona tu ubicación GPS.');
      return;
    }

    if (
      form.locationType === 'address' &&
      !form.address.trim()
    ) {
      setError('Ingresa la dirección del servicio.');
      return;
    }

    // Preparado para la futura integración con backend.
    // No se publica ni se guarda un servicio todavía.
    console.log('Formulario validado', {
      ...form,
      coordinates,
      imageName: image?.name ?? null
    });

    setError(
      'Formulario validado. Falta conectar la publicación al backend.'
    );
  };

  return (
    <section className="publish-service-page">

      <button
        type="button"
        className="publish-back"
        onClick={onBack}
      >
        ← Volver a Servicios Locales
      </button>

      <header className="publish-heading">
        <div className="publish-heading-icon">⚒</div>

        <div>
          <h1>Publicar Nuevo Servicio</h1>
          <p>Ofrece un servicio a tu comunidad.</p>
        </div>
      </header>

      <form className="publish-form" onSubmit={handleSubmit}>

        <div className="publish-field">
          <label htmlFor="service-title">
            Título del servicio *
          </label>

          <input
            id="service-title"
            name="title"
            value={form.title}
            onChange={updateField}
            placeholder="Ej. Electricista a domicilio"
            maxLength={100}
            required
          />
        </div>

        <div className="publish-two-columns">

          <div className="publish-field">
            <label htmlFor="service-category">
              Categoría *
            </label>

            <select
              id="service-category"
              name="category"
              value={form.category}
              onChange={updateField}
              required
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="publish-field">
            <label htmlFor="service-type">
              Tipo de servicio *
            </label>

            <select
              id="service-type"
              name="type"
              value={form.type}
              onChange={updateField}
              required
            >
              {serviceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="publish-field">
          <label htmlFor="service-description">
            Descripción *
          </label>

          <textarea
            id="service-description"
            name="description"
            value={form.description}
            onChange={updateField}
            placeholder="Describe tu servicio, horarios y experiencia..."
            rows={5}
            maxLength={500}
            required
          />

          <span className="publish-counter">
            {form.description.length}/500
          </span>
        </div>

        <div className="publish-field">
          <label htmlFor="service-phone">
            Número de contacto *
          </label>

          <input
            id="service-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={updateField}
            placeholder="Ej. 987654321"
            pattern="[0-9]{9}"
            maxLength={9}
            inputMode="numeric"
            title="Ingresa un número de 9 dígitos"
            required
          />

          <small>
            Este número podrá mostrarse en el detalle público
            del servicio.
          </small>
        </div>

        <div className="publish-location">

          <div className="publish-location-title">
            <span>⌖</span>
            <div>
              <h3>Ubicación del servicio *</h3>
              <p>Indica dónde prestas el servicio.</p>
            </div>
          </div>

          <div className="publish-two-columns">

            <button
              type="button"
              className={`publish-location-option ${
                form.locationType === 'gps' ? 'active' : ''
              }`}
              onClick={() => selectLocationType('gps')}
            >
              ◎ Mi ubicación (GPS)
            </button>

            <button
              type="button"
              className={`publish-location-option ${
                form.locationType === 'address' ? 'active' : ''
              }`}
              onClick={() => selectLocationType('address')}
            >
              ⌂ Dirección específica
            </button>

          </div>

          {form.locationType === 'gps' ? (
            <div className="publish-location-content">
              <p>
                {coordinates
                  ? `Ubicación seleccionada: ${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`
                  : 'Todavía no has seleccionado una ubicación.'}
              </p>

              <button
                type="button"
                className="publish-outline-button"
                onClick={useCurrentLocation}
              >
                ◎ Usar mi ubicación
              </button>

              <small>
                Próximamente podrás seleccionar un punto
                directamente sobre el mapa.
              </small>
            </div>
          ) : (
            <div className="publish-field">
              <label htmlFor="service-address">
                Dirección del servicio *
              </label>

              <input
                id="service-address"
                name="address"
                value={form.address}
                onChange={updateField}
                placeholder="Ej. Av. Ejército 123, Cayma"
                required
              />
            </div>
          )}

        </div>

        <div className="publish-field">
          <label htmlFor="service-availability">
            Disponibilidad *
          </label>

          <select
            id="service-availability"
            name="availability"
            value={form.availability}
            onChange={updateField}
            required
          >
            <option value="">Selecciona tu horario</option>
            <option value="weekdays">
              Lunes a viernes
            </option>
            <option value="weekends">
              Sábados y domingos
            </option>
            <option value="everyday">
              Todos los días
            </option>
            <option value="appointment">
              Previa coordinación
            </option>
          </select>
        </div>

        <div className="publish-field">
          <label htmlFor="service-image">
            Imagen del servicio
          </label>

          <label
            className="publish-image-upload"
            htmlFor="service-image"
          >
            {preview ? (
              <img
                src={preview}
                alt="Vista previa del servicio"
              />
            ) : (
              <>
                <span className="publish-upload-icon">▧</span>
                <strong>Seleccionar imagen</strong>
                <small>JPG o PNG, máximo 5 MB</small>
              </>
            )}
          </label>

          <input
            id="service-image"
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleImage}
            className="publish-file-input"
          />
        </div>

        {error && (
          <p className="publish-message" role="status">
            {error}
          </p>
        )}

        <div className="publish-actions">
          <button
            type="button"
            className="publish-cancel"
            onClick={onBack}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="publish-submit"
          >
            Publicar servicio
          </button>
        </div>

      </form>
    </section>
  );
}
