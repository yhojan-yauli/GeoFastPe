import { useState } from 'react';
import { ArrowLeft, CalendarPlus, ImagePlus, Send } from 'lucide-react';
import MapPointPicker from '../../components/common/MapPointPicker.jsx';
import './Events.css';

const categories = ['Cultura', 'Deporte', 'Educación', 'Salud', 'Ambiente', 'Otros'];
const types = ['Presencial', 'Virtual', 'Híbrido'];

export default function CreateEvent({ onBack, onSubmitEvent, onPickLocation }) {
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
      setError('Completa los campos obligatorios.');
      return;
    }

    if (!point) {
      setError('Elige el lugar del evento haciendo clic en el mapa.');
      return;
    }

    if (new Date(`${form.date}T${form.time}`) <= new Date()) {
      setError('Selecciona una fecha y hora futuras.');
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
      setError(submitError.message || 'No se pudo publicar el evento.');
    } finally {
      setBusy(false);
    }
  };

  const chooseImage = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type) || f.size > 5 * 1024 * 1024) {
      setError('Selecciona una imagen JPG, PNG o WEBP de máximo 5 MB.');
      e.target.value = '';
      return;
    }
    setError('');
    setImage(f);
  };

  return <section className="gf-events gf-events-form-page">
    <button type="button" className="gf-events-back" onClick={onBack}><ArrowLeft size={16}/> Volver a Eventos</button>
    <header className="gf-events-hero"><div className="gf-events-hero-copy"><CalendarPlus size={38}/><div><h1>Crear Nuevo Evento</h1><p>Organiza una actividad para tu comunidad.</p></div></div></header>
    <form className="gf-events-form" onSubmit={handleSubmit}>
      <label>Nombre del evento *<input required maxLength={120} value={form.title} onChange={(e) => change('title', e.target.value)} placeholder="Ej. Feria de reciclaje"/></label>
      <div className="gf-events-form-grid">
        <label>Categoría *<select value={form.category} onChange={(e) => change('category', e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>Tipo de evento *<select value={form.type} onChange={(e) => change('type', e.target.value)}>{types.map((t) => <option key={t}>{t}</option>)}</select></label>
      </div>
      <label>Descripción *<textarea required maxLength={500} rows={5} value={form.description} onChange={(e) => change('description', e.target.value)} placeholder="Describe el objetivo, actividades y público del evento..."/><small className="gf-events-count">{form.description.length}/500</small></label>
      <div className="gf-events-form-grid">
        <label>Fecha *<input required type="date" value={form.date} onChange={(e) => change('date', e.target.value)}/></label>
        <label>Hora *<input required type="time" value={form.time} onChange={(e) => change('time', e.target.value)}/></label>
      </div>
      <label>Nombre del lugar *<input required maxLength={200} value={form.location} onChange={(e) => change('location', e.target.value)} placeholder="Ej. Parque Selva Alegre, Arequipa"/></label>
      <div><strong>Punto en el mapa *</strong><MapPointPicker value={point} onPick={onPickLocation} onChange={setPoint} /></div>
      <label>Imagen del evento (opcional)
        <span className="gf-events-upload"><ImagePlus size={28}/><span>{image ? image.name : 'Seleccionar imagen'}</span><small>JPG, PNG o WEBP · máximo 5 MB</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage}/></span>
      </label>
      {error && <p role="alert" className="gf-events-error">{error}</p>}
      <div className="gf-events-form-actions">
        <button type="button" onClick={onBack} disabled={busy}>Cancelar</button>
        <button type="submit" className="gf-events-primary" disabled={busy}><Send size={16}/> {busy ? 'Publicando...' : 'Publicar evento'}</button>
      </div>
    </form>
  </section>;
}
