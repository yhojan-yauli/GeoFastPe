import { useEffect, useState } from 'react';
import { ArrowLeft, HeartHandshake, ImagePlus, Send, X } from 'lucide-react';
import MapPointPicker from '../../components/common/MapPointPicker.jsx';
import './SolidarityForm.css';

const categories = ['Alimentos', 'Ropa', 'Útiles', 'Salud', 'Otros'];

export default function RequestHelp({ onBack, onSubmitRequest, onPickLocation }) {
  const [point, setPoint] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: 'Alimentos',
    description: '',
    urgency: 'Media',
    location: ''
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!image) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const update = (event) => {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
    setError('');
    setSuccess('');
  };

  const chooseImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError('Selecciona una imagen JPG, PNG o WEBP de hasta 5 MB.');
      event.target.value = '';
      return;
    }
    setImage(file);
    setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setError('');
    setSuccess('');

    if (!form.title.trim() || !form.description.trim()) {
      setError('Completa los campos obligatorios.');
      return;
    }

    if (!point) {
      setError('Elige la ubicación de la solicitud haciendo clic en el mapa.');
      return;
    }

    try {
      setBusy(true);
      await onSubmitRequest?.({
        tipo: 'SOLICITUD',
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        urgency: form.urgency,
        location: form.location.trim() || null,
        lat: point.lat,
        lng: point.lng,
        image
      });
      setSuccess('Solicitud publicada correctamente.');
    } catch (submitError) {
      setError(submitError.message || 'No se pudo publicar la solicitud.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="solidarity-form-page">
      <div className="solidarity-form-container">
        <button className="solidarity-form-back" type="button" onClick={() => onBack?.()}>
          <ArrowLeft size={17} /> Volver a Solidaridad
        </button>

        <div className="solidarity-form-card">
          <div className="solidarity-form-heading">
            <span className="solidarity-form-heading-icon"><HeartHandshake size={28} /></span>
            <div>
              <h1>Solicitar ayuda</h1>
              <p>Cuéntanos qué necesitas y recibe apoyo de tu comunidad.</p>
            </div>
          </div>

          <form className="solidarity-form" onSubmit={submit}>
            <div className="solidarity-form-field">
              <label htmlFor="help-title">Título de la solicitud *</label>
              <input id="help-title" name="title" value={form.title} onChange={update} placeholder="Ej. Necesito apoyo con víveres" maxLength={120} required />
            </div>

            <div className="solidarity-form-field">
              <label htmlFor="help-category">Categoría *</label>
              <select id="help-category" name="category" value={form.category} onChange={update}>
                {categories.map((cat) => <option key={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="solidarity-form-field">
              <label htmlFor="help-description">Descripción *</label>
              <textarea id="help-description" name="description" rows={4} value={form.description} onChange={update} maxLength={500} placeholder="Detalla tu necesidad..." required />
              <span className="solidarity-form-counter">{form.description.length}/500</span>
            </div>

            <div className="solidarity-form-field">
              <label>Nivel de urgencia *</label>
              <div className="solidarity-form-urgency">
                {['Baja', 'Media', 'Alta'].map((value) => (
                  <button key={value} type="button" className={form.urgency === value ? 'active' : ''} onClick={() => setForm((previous) => ({ ...previous, urgency: value }))}>
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="solidarity-form-field">
              <label>Ubicación en el mapa *</label>
              <MapPointPicker value={point} onPick={onPickLocation} onChange={setPoint} />
              <label htmlFor="help-location">Referencia (opcional)</label>
              <input id="help-location" name="location" value={form.location} onChange={update} placeholder="Ej. Distrito de Cayma, Arequipa" maxLength={120} />
              <span className="solidarity-form-hint">Marca una zona aproximada en el mapa; no necesitas tu dirección exacta.</span>
            </div>

            <div className="solidarity-form-field">
              <label htmlFor="help-image">Imagen (opcional)</label>
              <input id="help-image" type="file" accept="image/jpeg,image/png,image/webp" className="solidarity-form-file" onChange={chooseImage} />
              {preview ? (
                <div className="solidarity-form-preview">
                  <img src={preview} alt="Vista previa" />
                  <button type="button" aria-label="Eliminar imagen" onClick={() => { setImage(null); document.getElementById('help-image').value = ''; }}>
                    <X size={17} />
                  </button>
                </div>
              ) : (
                <label htmlFor="help-image" className="solidarity-form-upload">
                  <ImagePlus size={24} />
                  <strong>Adjunta una imagen (opcional)</strong>
                  <span>JPG, PNG o WEBP · Máximo 5 MB</span>
                </label>
              )}
            </div>

            {error && <div className="solidarity-form-error" role="alert">{error}</div>}
            {success && <div className="solidarity-form-success" role="status">{success}</div>}

            <div className="solidarity-form-actions">
              <button className="solidarity-form-cancel" type="button" onClick={() => onBack?.()}>Cancelar</button>
              <button className="solidarity-form-submit" type="submit" disabled={busy}>
                <Send size={17} />{busy ? 'Procesando...' : 'Publicar solicitud'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
