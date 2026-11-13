import { useEffect, useState } from 'react';
import { ArrowLeft, HeartHandshake, ImagePlus, Plus, X } from 'lucide-react';
import MapPointPicker from '../../components/common/MapPointPicker.jsx';
import { usePreferences } from '../../preferences/PreferencesContext.jsx';
import './SolidarityForm.css';

const categories = ['Alimentos', 'Ropa', 'Útiles', 'Salud', 'Otros'];

export default function PublishDonation({ onBack, onSubmitDonation, onPickLocation }) {
  const { tr } = usePreferences();
  const [point, setPoint] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: 'Alimentos',
    description: '',
    condition: 'Buen estado',
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
      setError(tr('Selecciona una imagen JPG, PNG o WEBP de hasta 5 MB.'));
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
      setError(tr('Completa los campos obligatorios.'));
      return;
    }

    if (!point) {
      setError(tr('Elige la ubicación de la donación haciendo clic en el mapa.'));
      return;
    }

    try {
      setBusy(true);
      await onSubmitDonation?.({
        tipo: 'DONACION',
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        condition: form.condition,
        location: form.location.trim() || null,
        lat: point.lat,
        lng: point.lng,
        image
      });
      setSuccess(tr('Donación publicada correctamente.'));
    } catch (submitError) {
      setError(submitError.message || tr('No se pudo publicar la donación.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="solidarity-form-page">
      <div className="solidarity-form-container">
        <button className="solidarity-form-back" type="button" onClick={() => onBack?.()}>
          <ArrowLeft size={17} /> {tr('Volver a Solidaridad')}
        </button>

        <div className="solidarity-form-card">
          <div className="solidarity-form-heading">
            <span className="solidarity-form-heading-icon"><HeartHandshake size={28} /></span>
            <div>
              <h1>{tr('Publicar donación')}</h1>
              <p>{tr('Comparte recursos que puedan ayudar a otras personas.')}</p>
            </div>
          </div>

          <form className="solidarity-form" onSubmit={submit}>
            <div className="solidarity-form-field">
              <label htmlFor="donation-title">{tr('Título de la donación *')}</label>
              <input id="donation-title" name="title" value={form.title} onChange={update} placeholder={tr('Ej. Ropa de invierno en buen estado')} maxLength={120} required />
            </div>

            <div className="solidarity-form-field">
              <label htmlFor="donation-category">{tr('Categoría *')}</label>
              <select id="donation-category" name="category" value={form.category} onChange={update}>
                {categories.map((cat) => <option key={cat} value={cat}>{tr(cat)}</option>)}
              </select>
            </div>

            <div className="solidarity-form-field">
              <label htmlFor="donation-description">{tr('Descripción *')}</label>
              <textarea id="donation-description" name="description" rows={4} value={form.description} onChange={update} maxLength={500} placeholder={tr('Describe qué vas a donar y cómo se puede coordinar la entrega...')} required />
              <span className="solidarity-form-counter">{form.description.length}/500</span>
            </div>

            <div className="solidarity-form-field">
              <label htmlFor="donation-condition">{tr('Estado de los artículos *')}</label>
              <select id="donation-condition" name="condition" value={form.condition} onChange={update}>
                <option value="Nuevo">{tr('Nuevo')}</option>
                <option value="Buen estado">{tr('Buen estado')}</option>
                <option value="Usado">{tr('Usado')}</option>
              </select>
            </div>

            <div className="solidarity-form-field">
              <label>{tr('Ubicación en el mapa *')}</label>
              <MapPointPicker value={point} onPick={onPickLocation} onChange={setPoint} />
              <label htmlFor="donation-location">{tr('Referencia (opcional)')}</label>
              <input id="donation-location" name="location" value={form.location} onChange={update} placeholder={tr('Ej. Distrito de Cayma, Arequipa')} maxLength={120} />
              <span className="solidarity-form-hint">{tr('Marca una zona aproximada en el mapa; no necesitas tu dirección exacta.')}</span>
            </div>

            <div className="solidarity-form-field">
              <label htmlFor="donation-image">{tr('Imagen (opcional)')}</label>
              <input id="donation-image" type="file" accept="image/jpeg,image/png,image/webp" className="solidarity-form-file" onChange={chooseImage} />
              {preview ? (
                <div className="solidarity-form-preview">
                  <img src={preview} alt={tr('Vista previa')} />
                  <button type="button" aria-label={tr('Eliminar imagen')} onClick={() => { setImage(null); document.getElementById('donation-image').value = ''; }}>
                    <X size={17} />
                  </button>
                </div>
              ) : (
                <label htmlFor="donation-image" className="solidarity-form-upload">
                  <ImagePlus size={24} />
                  <strong>{tr('Adjunta una imagen (opcional)')}</strong>
                  <span>{tr('JPG, PNG o WEBP · Máximo 5 MB')}</span>
                </label>
              )}
            </div>

            {error && <div className="solidarity-form-error" role="alert">{error}</div>}
            {success && <div className="solidarity-form-success" role="status">{success}</div>}

            <div className="solidarity-form-actions">
              <button className="solidarity-form-cancel" type="button" onClick={() => onBack?.()}>{tr('Cancelar')}</button>
              <button className="solidarity-form-submit" type="submit" disabled={busy}>
                <Plus size={17} />{busy ? tr('Procesando...') : tr('Publicar donación')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
