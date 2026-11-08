import { useRef, useState } from 'react';
import { Siren, ArrowLeft, MapPin, Crosshair, ImagePlus, Plus, Send, X, AlertTriangle } from 'lucide-react';
import { EMERGENCY_TYPES } from './EmergencyPage.jsx';
import './Emergency.css';

const MAX_IMAGES = 5;
export default function ReportEmergency({ initialType = 'Incendio', onBack, onSubmit }) {
  const [title,setTitle] = useState('');
  const [type,setType] = useState(initialType);
  const [urgency,setUrgency] = useState('Alta');
  const [description,setDescription] = useState('');
  const [locationText,setLocationText] = useState('');
  const [coords,setCoords] = useState(null);
  const [manual,setManual] = useState(false);
  const [latitude,setLatitude] = useState('');
  const [longitude,setLongitude] = useState('');
  const [images,setImages] = useState([]);
  const [error,setError] = useState('');
  const [gpsBusy,setGpsBusy] = useState(false);
  const fileRef = useRef(null);

  function useGps() {
    if (!navigator.geolocation) { setError('Tu navegador no permite obtener la ubicación. Ingresa una referencia.'); return; }
    setGpsBusy(true); setError('');
    navigator.geolocation.getCurrentPosition(({coords:c})=>{setCoords({lat:c.latitude,lng:c.longitude});setLatitude(String(c.latitude));setLongitude(String(c.longitude));setGpsBusy(false);},()=>{setGpsBusy(false);setError('No se pudo obtener tu ubicación. Puedes ingresar coordenadas o una referencia.');},{enableHighAccuracy:true,timeout:12000});
  }
  function addImages(event) {
    const incoming=Array.from(event.target.files || []);
    if (incoming.some(f=>!['image/png','image/jpeg'].includes(f.type) || f.size>5*1024*1024)) {setError('Solo imágenes PNG/JPG de máximo 5 MB cada una.');event.target.value='';return;}
    if (images.length+incoming.length>MAX_IMAGES) {setError('Puedes adjuntar como máximo 5 imágenes.');event.target.value='';return;}
    setImages(current=>[...current,...incoming]);setError('');event.target.value='';
  }
  function submit(event) {
    event.preventDefault();
    const lat=Number(latitude),lng=Number(longitude);
    const coordinateEntered=latitude.trim()!=='' || longitude.trim()!=='';
    if (coordinateEntered && (latitude.trim()==='' || longitude.trim()==='' || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat)>90 || Math.abs(lng)>180)) {setError('Ingresa latitud y longitud válidas.');return;}
    if (!locationText.trim() && !coordinateEntered && !coords) {setError('Indica una ubicación mediante GPS, coordenadas o dirección de referencia.');return;}
    if (!onSubmit) {setError('El formulario aún no está conectado al registro de reportes.');return;}
    onSubmit({id:Date.now(),title:title.trim(),type,urgency,description:description.trim(),locationText:locationText.trim() || (coordinateEntered ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`),coordinates:coordinateEntered?{lat,lng}:coords,images:images.map(f=>({name:f.name,size:f.size})),createdAt:new Date().toISOString()});
  }
  return <div className="sos-page sos-form-page"><button type="button" className="sos-back" onClick={onBack}><ArrowLeft size={17}/> Volver a Emergencias</button>
    <section className="sos-form-hero"><Siren size={39}/><div><h1>Reportar Emergencia</h1><p>Brinda información clara para registrar la alerta.</p></div></section>
    <form className="sos-form" onSubmit={submit}>
      <label>Título de la emergencia <em>*</em><input required maxLength={120} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ej. Incendio en vivienda"/></label>
      <div className="sos-form-grid"><label>Tipo de emergencia <em>*</em><select required value={type} onChange={e=>setType(e.target.value)}>{EMERGENCY_TYPES.map(t=><option key={t.name}>{t.name}</option>)}</select></label><label>Nivel de urgencia <em>*</em><select value={urgency} onChange={e=>setUrgency(e.target.value)}><option value="Alta">🔴 Alta</option><option value="Media">🟠 Media</option><option value="Baja">🟢 Baja</option></select></label></div>
      <label>Descripción <em>*</em><textarea required maxLength={500} rows={5} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Detalla lo que está ocurriendo, ubicación, personas afectadas u otra información relevante."/><span className="sos-counter">{description.length}/500</span></label>
      <div className="sos-location"><strong>Ubicación <em>*</em></strong><button type="button" className="sos-map-btn" onClick={()=>setManual(v=>!v)}><MapPin size={19}/> {manual?'Ocultar coordenadas':'Indicar punto por coordenadas'} <Crosshair size={18}/></button><div className="sos-location-row"><small>Usa GPS, coordenadas o escribe una dirección de referencia.</small><button type="button" onClick={useGps} disabled={gpsBusy}><Crosshair size={15}/> {gpsBusy?'Obteniendo…':'Usar GPS'}</button></div>{manual && <div className="sos-form-grid"><label>Latitud<input inputMode="decimal" placeholder="Ej. -16.3989" value={latitude} onChange={e=>setLatitude(e.target.value)}/></label><label>Longitud<input inputMode="decimal" placeholder="Ej. -71.5350" value={longitude} onChange={e=>setLongitude(e.target.value)}/></label></div>}{coords && <small className="sos-gps-ok">GPS obtenido: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</small>}<label>Dirección o referencia (obligatoria si no usas GPS o coordenadas)<input value={locationText} maxLength={200} onChange={e=>setLocationText(e.target.value)} placeholder="Ej. Av. Dolores, cerca del parque"/></label></div>
      <div><strong>Evidencias <span className="sos-muted">(opcional, máx. 5)</span></strong><div className="sos-upload-row"><button type="button" className="sos-upload" onClick={()=>fileRef.current?.click()}><ImagePlus size={26}/> Seleccionar imágenes <small>PNG, JPG · Máx. 5 MB por imagen</small></button><button type="button" className="sos-upload-add" onClick={()=>fileRef.current?.click()}><Plus/> Agregar</button></div><input ref={fileRef} type="file" accept="image/png,image/jpeg" multiple hidden onChange={addImages}/>{images.length>0 && <div className="sos-image-list">{images.map((f,i)=><span key={`${f.name}-${i}`}>{f.name}<button type="button" aria-label={`Quitar ${f.name}`} onClick={()=>setImages(arr=>arr.filter((_,j)=>j!==i))}><X size={14}/></button></span>)}</div>}</div>
      <p className="sos-warning"><AlertTriangle size={17}/> Prototipo: el reporte se guarda temporalmente en esta aplicación. No se notifica automáticamente a autoridades ni a servicios de emergencia.</p>
      {error && <p className="sos-error" role="alert">{error}</p>}
      <div className="sos-form-actions"><button type="button" className="sos-cancel" onClick={onBack}>Cancelar</button><button type="submit" className="sos-primary"><Send size={17}/> Enviar reporte</button></div>
    </form>
  </div>;
}
