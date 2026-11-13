import { useState } from 'react';
import { ArrowLeft, CalendarPlus, ImagePlus, Send } from 'lucide-react';
import MapPointPicker from '../../components/common/MapPointPicker.jsx';
import { usePreferences } from '../../preferences/PreferencesContext.jsx';
import './Events.css';

const categories = ['Cultura', 'Deporte', 'Educación', 'Salud', 'Ambiente', 'Otros'];
const types = ['Presencial', 'Virtual', 'Híbrido'];

export default function CreateEvent({ onBack, onSubmitEvent, onPickLocation }) {
  const { tr } = usePreferences();
  const [form, setForm] = useState({ title: '', category: 'Cultura', type: 'Presencial', description: '', date: '', time: '', location: '' });
  const [point, setPoint] = useState(null);
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');

    if (!form.title.trim() || !form.description.trim() || !form.date || !form.time || !form.location.trim()) {
      setError(tr('Completa los campos obligatorios.'));
      return;
    }

    if (!point) {
      setError(tr('Elige el lugar del evento haciendo clic en el mapa.'));
      return;
    }

    if (new Date(`${form.date}T${form.time}`) <= new Date()) {
      setError(tr('Selecciona una fecha y hora futuras.'));
      return;
    }

    try {
      setBusy(true);
      await onSubmitEvent?.({
        title: form.title.trim(),
        category: form.category,
        type: form.type,
        description: form.description.trim(),
        date: form.date,
        time: form.time,
        location: form.location.trim(),
        lat: point.lat,
        lng: point.lng,
        image
      });
    } catch (submitError) {
      setError(submitError.message || tr('No se pudo publicar el evento.'));
    } finally {
      setBusy(false);
    }
  };

  const chooseImage = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type) || f.size > 5 * 1024 * 1024) {
      setError(tr('Selecciona una imagen JPG, PNG o WEBP de máximo 5 MB.'));
      e.target.value = '';
      return;
    }
    setError('');
    setImage(f);
  };

  return <section className="gf-events gf-events-form-page">
    <button type="button" className="gf-events-back" onClick={onBack}><ArrowLeft size={16}/> {tr('Volver a Eventos')}</button>
    <header className="gf-events-hero"><div className="gf-events-hero-copy"><CalendarPlus size={38}/><div><h1>{tr('Crear Nuevo Evento')}</h1><p>{tr('Organiza una actividad para tu comunidad.')}</p></div></div></header>
    <form className="gf-events-form" onSubmit={handleSubmit}>
      <label>{tr('Nombre del evento *')}<input required maxLength={120} value={form.title} onChange={(e) => change('title', e.target.value)} placeholder={tr('Ej. Feria de reciclaje')}/></label>
      <div className="gf-events-form-grid">
        <label>{tr('Categoría *')}<select value={form.category} onChange={(e) => change('category', e.target.value)}>{categories.map((c) => <option key={c} value={c}>{tr(c)}</option>)}</select></label>
        <label>{tr('Tipo de evento *')}<select value={form.type} onChange={(e) => change('type', e.target.value)}>{types.map((t) => <option key={t} value={t}>{tr(t)}</option>)}</select></label>
      </div>
      <label>{tr('Descripción *')}<textarea required maxLength={500} rows={5} value={form.description} onChange={(e) => change('description', e.target.value)} placeholder={tr('Describe el objetivo, actividades y público del evento...')}/><small className="gf-events-count">{form.description.length}/500</small></label>
      <div className="gf-events-form-grid">
        <label>{tr('Fecha *')}<input required type="date" value={form.date} onChange={(e) => change('date', e.target.value)}/></label>
        <label>{tr('Hora *')}<input required type="time" value={form.time} onChange={(e) => change('time', e.target.value)}/></label>
      </div>
      <label>{tr('Nombre del lugar *')}<input required maxLength={200} value={form.location} onChange={(e) => change('location', e.target.value)} placeholder={tr('Ej. Parque Selva Alegre, Arequipa')}/></label>
      <div><strong>{tr('Punto en el mapa *')}</strong><MapPointPicker value={point} onPick={onPickLocation} onChange={setPoint} /></div>
      <label>{tr('Imagen del evento (opcional)')}
        <span className="gf-events-upload"><ImagePlus size={28}/><span>{image ? image.name : tr('Seleccionar imagen')}</span><small>{tr('JPG, PNG o WEBP · máximo 5 MB')}</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage}/></span>
      </label>
      {error && <p role="alert" className="gf-events-error">{error}</p>}
      <div className="gf-events-form-actions">
        <button type="button" onClick={onBack} disabled={busy}>{tr('Cancelar')}</button>
        <button type="submit" className="gf-events-primary" disabled={busy}><Send size={16}/> {busy ? tr('Publicando...') : tr('Publicar evento')}</button>
      </div>
    </form>
  </section>;
}
