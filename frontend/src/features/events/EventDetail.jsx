import { useState } from 'react';
import { ArrowLeft, CalendarDays, MapPin, Users, Tag, Monitor } from 'lucide-react';
import './Events.css';

export default function EventDetail({ event, onBack, onToggleParticipation }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!event) return null;

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
    <button type="button" className="gf-events-back" onClick={onBack}><ArrowLeft size={16}/> Volver a Eventos</button>
    <header className="gf-events-hero"><div className="gf-events-hero-copy"><CalendarDays size={38}/><div><h1>{event.title}</h1><p>Información del evento comunitario</p></div></div></header>
    <article className="gf-events-detail">
      <span className="gf-events-tag">{event.category}</span>
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      <div className="gf-events-detail-facts">
        <p><CalendarDays size={18}/> {event.date} · {event.time}</p>
        <p><MapPin size={18}/> {event.location}</p>
        <p><Monitor size={18}/> {event.type}</p>
        <p><Users size={18}/> {event.participants || 0} participantes</p>
        <p><Tag size={18}/> {event.status}</p>
      </div>
      {onToggleParticipation && (
        <button type="button" className="gf-events-primary" onClick={toggle} disabled={busy}>
          {busy ? 'Actualizando...' : event.joined ? 'Dejar de participar' : 'Participar en el evento'}
        </button>
      )}
      {error && <p role="alert" className="gf-events-error">{error}</p>}
    </article>
  </section>;
}
