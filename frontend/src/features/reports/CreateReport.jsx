import { useRef, useState } from 'react';
import { Flag, ImagePlus, Send, X } from 'lucide-react';
import MapPointPicker from '../../components/common/MapPointPicker.jsx';
import './Reports.css';

const categories = ['Infraestructura', 'Seguridad', 'Servicios', 'Otro'];

export default function CreateReport({ onBack, onSubmitReport, onPickLocation }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Infraestructura');
  const [priority, setPriority] = useState('Alta');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [point, setPoint] = useState(null);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const addFiles = (event) => {
    const selected = Array.from(event.target.files || []);
    const combined = [...files, ...selected];
    if (combined.length > 5) {
      setMessage('Máximo cinco imágenes.');
      event.target.value = '';
      return;
    }
    if (combined.some((f) => !['image/jpeg', 'image/png', 'image/webp'].includes(f.type) || f.size > 5 * 1024 * 1024)) {
      setMessage('Solo JPG, PNG o WEBP de hasta 5 MB por imagen.');
      event.target.value = '';
      return;
    }
    setFiles(combined);
    setMessage('');
    event.target.value = '';
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!point) {
      setMessage('Elige la ubicación del reporte haciendo clic en el mapa.');
      return;
    }

    try {
      setBusy(true);
      await onSubmitReport?.({
        title: title.trim(),
        category,
        priority,
        description: description.trim(),
        location: location.trim() || null,
        lat: point.lat,
        lng: point.lng,
        images: files
      });
    } catch (error) {
      setMessage(error.message || 'No se pudo enviar el reporte.');
    } finally {
      setBusy(false);
    }
  };

  return <section className="gf-reports gf-create-report">
    <button className="gf-back-link" onClick={onBack}>← Volver a Reportes</button>
    <header className="gf-reports-header"><div className="gf-reports-header-title"><Flag size={36}/><div><h1>Crear Reporte</h1><p>Describe la incidencia y ayuda a resolverla.</p></div></div></header>
    <form className="gf-report-form" onSubmit={submit}>
      <label>Título del reporte <b>*</b><input required maxLength={120} placeholder="Ej. Bache en la calle principal" value={title} onChange={(e) => setTitle(e.target.value)}/></label>
      <div className="gf-form-row">
        <label>Categoría <b>*</b><select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>Prioridad <b>*</b><select value={priority} onChange={(e) => setPriority(e.target.value)}><option value="Alta">Alta</option><option value="Media">Media</option><option value="Baja">Baja</option></select></label>
      </div>
      <label>Descripción <b>*</b><textarea required maxLength={500} rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe detalladamente la incidencia..."/><small className="gf-counter">{description.length}/500</small></label>
      <div className="gf-location-field">
        <strong>Ubicación <b>*</b></strong>
        <MapPointPicker value={point} onPick={onPickLocation} onChange={setPoint} />
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Referencia o dirección (opcional)"/>
      </div>
      <div className="gf-upload">
        <strong>Adjuntar evidencias (opcional, máx. 5)</strong>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={addFiles}/>
        <button type="button" className="gf-upload-target" onClick={() => fileRef.current?.click()}><ImagePlus size={29}/><span>Seleccionar imágenes</span><small>JPG, PNG o WEBP · Máx. 5 MB por imagen</small></button>
        {files.length > 0 && <div className="gf-files">{files.map((f, i) => <span key={`${f.name}-${i}`}>{f.name}<button type="button" aria-label={`Quitar ${f.name}`} onClick={() => setFiles((v) => v.filter((_, j) => j !== i))}><X size={14}/></button></span>)}</div>}
      </div>
      {message && <p className="gf-form-message" role="status">{message}</p>}
      <p className="gf-report-disclaimer">Los reportes se guardan en GeoFastPe. No se notifican automáticamente a las autoridades.</p>
      <footer className="gf-form-actions">
        <button type="button" className="gf-cancel" onClick={onBack}>Cancelar</button>
        <button type="submit" className="gf-primary" disabled={busy}><Send size={16}/> {busy ? 'Enviando...' : 'Enviar Reporte'}</button>
      </footer>
    </form>
  </section>;
}
