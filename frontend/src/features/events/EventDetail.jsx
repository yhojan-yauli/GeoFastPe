import { useState } from 'react';
import { ArrowLeft, CalendarDays, MapPin, Users, Tag, Monitor, Route } from 'lucide-react';
import { usePreferences } from '../../preferences/PreferencesContext.jsx';
import './Events.css';

export default function EventDetail({ event, onBack, onToggleParticipation, onShowMap }) {
  const { tr } = usePreferences();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!event) return null;

  const routeToEvent = () => {
    const api = window.GeoFastPe;
    if (!api) return;
    const lat = Number(event.lat ?? event.latitude);
    const lng = Number(event.lng ?? event.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) api.routeToCoordinates?.(lat, lng, event.title || 'Destino');
    else if (event.location) api.routeTo?.(event.location);
    onShowMap?.();
  };

  const toggle = async () => {
    setBusy(true);
    setError('');
    try {
      await onToggleParticipation?.(event);
    } catch (toggleError) {
      setError(toggleError.message || 'No se pudo actualizar tu asistencia.');
    } finally {
      setBusy(false);
    }
  };

  return <section className="gf-events gf-events-form-page">
    <button type="button" className="gf-events-back" onClick={onBack}><ArrowLeft size={16}/> {tr('Volver a Eventos')}</button>
    <header className="gf-events-hero"><div className="gf-events-hero-copy"><CalendarDays size={38}/><div><h1>{event.title}</h1><p>{tr('Información del evento comunitario')}</p></div></div></header>
    <article className="gf-events-detail">
      <span className="gf-events-tag">{tr(event.category)}</span>
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      <div className="gf-events-detail-facts">
        <p><CalendarDays size={18}/> {event.date} · {event.time}</p>
        <p><MapPin size={18}/> {event.location}</p>
        <p><Monitor size={18}/> {event.type ? tr(event.type) : ''}</p>
        <p><Users size={18}/> {event.participants || 0} {tr('participantes')}</p>
        <p><Tag size={18}/> {event.status ? tr(event.status) : ''}</p>
      </div>
      <button type="button" className="gf-events-secondary" onClick={routeToEvent} style={{ marginBottom: 10 }}>
        <Route size={16}/> {tr('Cómo llegar')}
      </button>
      {onToggleParticipation && (
        <button type="button" className="gf-events-primary" onClick={toggle} disabled={busy}>
          {busy ? tr('Actualizando...') : event.joined ? tr('Dejar de participar') : tr('Participar en el evento')}
        </button>
      )}
      {error && <p role="alert" className="gf-events-error">{tr(error)}</p>}
    </article>
  </section>;
}
