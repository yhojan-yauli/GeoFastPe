import { useRef, useState } from 'react';
import { Siren, ArrowLeft, ImagePlus, Plus, Send, X, AlertTriangle } from 'lucide-react';
import { EMERGENCY_TYPES } from './EmergencyPage.jsx';
import MapPointPicker from '../../components/common/MapPointPicker.jsx';
import { usePreferences } from '../../preferences/PreferencesContext.jsx';
import './Emergency.css';

const MAX_IMAGES = 5;

export default function ReportEmergency({ initialType = 'Incendio', onBack, onSubmit, onPickLocation }) {
  const { tr } = usePreferences();
  const [title, setTitle] = useState('');
  const [type, setType] = useState(initialType);
  const [urgency, setUrgency] = useState('Alta');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [point, setPoint] = useState(null);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  function addImages(event) {
    const incoming = Array.from(event.target.files || []);
    if (incoming.some((f) => !['image/jpeg', 'image/png', 'image/webp'].includes(f.type) || f.size > 5 * 1024 * 1024)) {
      setError(tr('Solo imágenes JPG, PNG o WEBP de máximo 5 MB cada una.'));
      event.target.value = '';
      return;
    }
    if (images.length + incoming.length > MAX_IMAGES) {
      setError(tr('Puedes adjuntar como máximo 5 imágenes.'));
      event.target.value = '';
      return;
    }
    setImages((current) => [...current, ...incoming]);
    setError('');
    event.target.value = '';
  }

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setError('');
    setSuccess('');

    if (!point) {
      setError(tr('Elige la ubicación de la emergencia haciendo clic en el mapa.'));
      return;
    }

    try {
      setBusy(true);
      await onSubmit?.({
        title: title.trim(),
        type,
        urgency,
        description: description.trim(),
        locationText: locationText.trim() || null,
        lat: point.lat,
        lng: point.lng,
        images
      });
      setSuccess(tr('Emergencia registrada correctamente.'));
    } catch (submitError) {
      setError(submitError.message || tr('No se pudo registrar la emergencia.'));
    } finally {
      setBusy(false);
    }
  }

  return <div className="sos-page sos-form-page">
    <button type="button" className="sos-back" onClick={onBack}><ArrowLeft size={17}/> {tr('Volver a Emergencias')}</button>
    <section className="sos-form-hero"><Siren size={39}/><div><h1>{tr('Reportar Emergencia')}</h1><p>{tr('Brinda información clara para registrar la alerta.')}</p></div></section>
    <form className="sos-form" onSubmit={submit}>
      <label>{tr('Título de la emergencia')} <em>*</em><input required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={tr('Ej. Incendio en vivienda')}/></label>
      <div className="sos-form-grid">
        <label>{tr('Tipo de emergencia')} <em>*</em><select required value={type} onChange={(e) => setType(e.target.value)}>{EMERGENCY_TYPES.map((t) => <option key={t.name} value={t.name}>{tr(t.name)}</option>)}</select></label>
        <label>{tr('Nivel de urgencia')} <em>*</em><select value={urgency} onChange={(e) => setUrgency(e.target.value)}><option value="Alta">{tr('Alta')}</option><option value="Media">{tr('Media')}</option><option value="Baja">{tr('Baja')}</option></select></label>
      </div>
      <label>{tr('Descripción')} <em>*</em><textarea required maxLength={500} rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={tr('Detalla lo que está ocurriendo, personas afectadas u otra información relevante.')}/><span className="sos-counter">{description.length}/500</span></label>
      <div className="sos-location">
        <strong>{tr('Ubicación')} <em>*</em></strong>
        <MapPointPicker value={point} onPick={onPickLocation} onChange={setPoint} />
        <label>{tr('Referencia (opcional)')}<input value={locationText} maxLength={200} onChange={(e) => setLocationText(e.target.value)} placeholder={tr('Ej. Av. Dolores, cerca del parque')}/></label>
      </div>
      <div>
        <strong>{tr('Evidencias')} <span className="sos-muted">{tr('(opcional, máx. 5)')}</span></strong>
        <div className="sos-upload-row">
          <button type="button" className="sos-upload" onClick={() => fileRef.current?.click()}><ImagePlus size={26}/> {tr('Seleccionar imágenes')} <small>{tr('JPG, PNG o WEBP · Máx. 5 MB por imagen')}</small></button>
          <button type="button" className="sos-upload-add" onClick={() => fileRef.current?.click()}><Plus/> {tr('Agregar')}</button>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={addImages}/>
        {images.length > 0 && <div className="sos-image-list">{images.map((f, i) => <span key={`${f.name}-${i}`}>{f.name}<button type="button" aria-label={`${tr('Quitar')} ${f.name}`} onClick={() => setImages((arr) => arr.filter((_, j) => j !== i))}><X size={14}/></button></span>)}</div>}
      </div>
      <p className="sos-warning"><AlertTriangle size={17}/> {tr('El reporte queda registrado en GeoFastPe. No se notifica automáticamente a autoridades ni a servicios de emergencia.')}</p>
      {error && <p className="sos-error" role="alert">{error}</p>}
      {success && <p className="sos-gps-ok" role="status">{success}</p>}
      <div className="sos-form-actions"><button type="button" className="sos-cancel" onClick={onBack} disabled={busy}>{tr('Cancelar')}</button><button type="submit" className="sos-primary" disabled={busy}><Send size={17}/> {busy ? tr('Enviando...') : tr('Enviar reporte')}</button></div>
    </form>
  </div>;
}
