import { Siren, Phone, HeartPulse, Flame, TriangleAlert, ShieldAlert, CloudLightning, Ellipsis, Info, ArrowRight, MapPin, Clock } from 'lucide-react';
import './Emergency.css';

export const EMERGENCY_TYPES = [
  { name: 'Salud', icon: HeartPulse },
  { name: 'Incendio', icon: Flame },
  { name: 'Riesgo en la vía', icon: TriangleAlert },
  { name: 'Seguridad', icon: ShieldAlert },
  { name: 'Desastre natural', icon: CloudLightning },
  { name: 'Otra', icon: Ellipsis },
];

export default function EmergencyPage({ reports = [], onReport }) {
  return <div className="sos-page">
    <section className="sos-hero">
      <div className="sos-hero-title"><Siren size={43}/><div><h1>Emergencias (SOS)</h1><p>Reporta una emergencia y solicita ayuda a tu comunidad.</p></div></div>
      <button type="button" className="sos-primary sos-danger" onClick={() => onReport?.()}><Phone size={21}/> Reportar emergencia</button>
      <small>El reporte se registra solo en esta demostración. No se envía automáticamente a autoridades ni servicios de emergencia.</small>
    </section>
    <h2>Tipos de emergencia</h2>
    <div className="sos-types">{EMERGENCY_TYPES.map(({name,icon:Icon},index)=><button key={name} type="button" className="sos-type" onClick={() => onReport?.(name)}><span className={`sos-type-icon sos-type-${index}`}><Icon size={27}/></span><strong>{name}</strong></button>)}</div>
    <h2>Emergencias recientes</h2>
    {reports.length ? <div className="sos-reports">{reports.map((report,index)=><article className="sos-report" key={report.id ?? index}><div><strong>{report.title}</strong><p>{report.type} · Urgencia {report.urgency}</p><p>{report.description}</p><span><MapPin size={14}/> {report.locationText || 'Ubicación indicada'}</span></div><span className="sos-report-date"><Clock size={14}/> {report.createdAt ? new Date(report.createdAt).toLocaleString('es-PE') : 'Reciente'}</span></article>)}</div> : <div className="sos-empty"><ShieldAlert size={32}/><strong>No hay emergencias registradas</strong><p>Los nuevos reportes aparecerán aquí.</p></div>}
    <section className="sos-how"><h2><Info size={20}/> ¿Cómo funciona?</h2><div className="sos-steps"><div><b>1</b><strong>Reporta la emergencia</strong></div><ArrowRight/><div><b>2</b><strong>Se registra la alerta</strong></div><ArrowRight/><div><b>3</b><strong>Consulta su seguimiento</strong></div></div></section>
    <p className="sos-safety">Si existe peligro inmediato, contacta directamente a los servicios de emergencia de tu localidad. Esta aplicación no sustituye una llamada de emergencia.</p>
  </div>;
}
