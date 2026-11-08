import { useEffect, useState } from 'react';
import { ArrowLeft, HeartHandshake, ImagePlus, MapPin, Send, X } from 'lucide-react';
import './SolidarityForm.css';
const categories = ['Alimentos', 'Ropa', 'Útiles', 'Salud', 'Otros'];
export default function RequestHelp({ onBack, onSubmitRequest }) {
  const [form, setForm] = useState({ title: '', category: 'Alimentos', description: '', urgency: 'Media', location: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (!image) { setPreview(''); return; } const url = URL.createObjectURL(image); setPreview(url); return () => URL.revokeObjectURL(url); }, [image]);
  const update = (e) => { setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })); setError(''); setSuccess(''); };
  const chooseImage = (e) => { const file = e.target.files?.[0]; if (!file) return; if (!['image/png','image/jpeg'].includes(file.type) || file.size > 5 * 1024 * 1024) { setError('Selecciona una imagen PNG o JPG de hasta 5 MB.'); e.target.value = ''; return; } setImage(file); setError(''); };
  const submit = async (e) => { e.preventDefault(); if (busy) return; setError(''); setSuccess(''); if (!form.title.trim() || !form.description.trim() || !form.location.trim()) { setError('Completa los campos obligatorios.'); return; } if (!onSubmitRequest) { setSuccess('Formulario validado. La solicitud aún no se ha guardado: falta conectar el backend.'); return; } try { setBusy(true); await onSubmitRequest({ ...form, title: form.title.trim(), description: form.description.trim(), location: form.location.trim(), image }); setSuccess('Solicitud procesada correctamente.'); } catch (err) { setError(err?.message || 'No se pudo procesar la solicitud.'); } finally { setBusy(false); } };
  return <section className="solidarity-form-page"><div className="solidarity-form-container"><button className="solidarity-form-back" type="button" onClick={() => onBack?.()}><ArrowLeft size={17}/> Volver a Solidaridad</button><div className="solidarity-form-card"><div className="solidarity-form-heading"><span className="solidarity-form-heading-icon"><HeartHandshake size={28}/></span><div><h1>Solicitar ayuda</h1><p>Cuéntanos qué necesitas y recibe apoyo de tu comunidad.</p></div></div><form className="solidarity-form" onSubmit={submit}>
    <div className="solidarity-form-field"><label htmlFor="help-title">Título de la solicitud *</label><input id="help-title" name="title" value={form.title} onChange={update} placeholder="Ej. Necesito apoyo con víveres" maxLength={120} required/></div>
    <div className="solidarity-form-field"><label htmlFor="help-category">Categoría *</label><select id="help-category" name="category" value={form.category} onChange={update}>{categories.map((cat) => <option key={cat}>{cat}</option>)}</select></div>
    <div className="solidarity-form-field"><label htmlFor="help-description">Descripción *</label><textarea id="help-description" name="description" rows={4} value={form.description} onChange={update} maxLength={300} placeholder="Detalla tu necesidad..." required/><span className="solidarity-form-counter">{form.description.length}/300</span></div>
    <div className="solidarity-form-field"><label>Nivel de urgencia *</label><div className="solidarity-form-urgency">{['Baja','Media','Alta'].map((value) => <button key={value} type="button" className={form.urgency === value ? 'active' : ''} onClick={() => setForm((prev) => ({ ...prev, urgency: value }))}>{value}</button>)}</div></div>
    <div className="solidarity-form-field"><label htmlFor="help-location">Ubicación aproximada *</label><input id="help-location" name="location" value={form.location} onChange={update} placeholder="Ej. Distrito de Cayma, Arequipa" required/><span className="solidarity-form-hint">No ingreses tu dirección exacta. La selección en el mapa se integrará posteriormente.</span></div>
    <div className="solidarity-form-field"><label htmlFor="help-image">Imagen (opcional)</label><input id="help-image" type="file" accept="image/png,image/jpeg" className="solidarity-form-file" onChange={chooseImage}/>{preview ? <div className="solidarity-form-preview"><img src={preview} alt="Vista previa"/><button type="button" aria-label="Eliminar imagen" onClick={() => {setImage(null); document.getElementById('help-image').value = '';}}><X size={17}/></button></div> : <label htmlFor="help-image" className="solidarity-form-upload"><ImagePlus size={24}/><strong>Adjunta una imagen (opcional)</strong><span>PNG o JPG · Máximo 5 MB</span></label>}</div>
    {error && <div className="solidarity-form-error" role="alert">{error}</div>}{success && <div className="solidarity-form-success" role="status">{success}</div>}
    <div className="solidarity-form-actions"><button className="solidarity-form-cancel" type="button" onClick={() => onBack?.()}>Cancelar</button><button className="solidarity-form-submit" type="submit" disabled={busy}><Send size={17}/>{busy ? 'Procesando...' : 'Publicar solicitud'}</button></div>
  </form></div></div></section>;
}
