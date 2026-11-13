import { Siren, Phone, HeartPulse, Flame, TriangleAlert, ShieldAlert, CloudLightning, Ellipsis, Info, ArrowRight, MapPin, Clock } from 'lucide-react';
import { usePreferences } from '../../preferences/PreferencesContext.jsx';
import './Emergency.css';

export const EMERGENCY_TYPES = [
  { name: 'Salud', icon: HeartPulse },
  { name: 'Incendio', icon: Flame },
  { name: 'Riesgo en la vía', icon: TriangleAlert },
  { name: 'Seguridad', icon: ShieldAlert },
  { name: 'Desastre natural', icon: CloudLightning },
  { name: 'Otra', icon: Ellipsis }
];

export default function EmergencyPage({ reports = [], onReport }) {
  const { tr, language } = usePreferences();
  return <div className="sos-page">
    <section className="sos-hero">
      <div className="sos-hero-title"><Siren size={43}/><div><h1>{tr('Emergencias (SOS)')}</h1><p>{tr('Reporta una emergencia y solicita ayuda a tu comunidad.')}</p></div></div>
      <button type="button" className="sos-primary sos-danger" onClick={() => onReport?.()}><Phone size={21}/> {tr('Reportar emergencia')}</button>
      <small>{tr('El reporte queda registrado en GeoFastPe. No se envía automáticamente a autoridades ni servicios de emergencia.')}</small>
    </section>
    <h2>{tr('Tipos de emergencia')}</h2>
    <div className="sos-types">{EMERGENCY_TYPES.map(({name,icon:Icon},index)=><button key={name} type="button" className="sos-type" onClick={() => onReport?.(name)}><span className={`sos-type-icon sos-type-${index}`}><Icon size={27}/></span><strong>{tr(name)}</strong></button>)}</div>
    <h2>{tr('Emergencias recientes')}</h2>
    {reports.length ? <div className="sos-reports">{reports.map((report)=><article className="sos-report" key={report.id}><div><strong>{report.title}</strong><p>{tr(report.type)} · {tr('Urgencia')} {tr(report.urgency)}</p><p>{report.description}</p><span><MapPin size={14}/> {report.locationText || tr('Ubicación por coordenadas')}</span></div><span className="sos-report-date"><Clock size={14}/> {report.createdAt ? new Date(report.createdAt).toLocaleString(language || 'es-PE') : tr('Reciente')}</span></article>)}</div> : <div className="sos-empty"><ShieldAlert size={32}/><strong>{tr('No hay emergencias registradas')}</strong><p>{tr('Los nuevos reportes aparecerán aquí.')}</p></div>}
    <section className="sos-how"><h2><Info size={20}/> {tr('¿Cómo funciona?')}</h2><div className="sos-steps"><div><b>1</b><strong>{tr('Reporta la emergencia')}</strong></div><ArrowRight/><div><b>2</b><strong>{tr('Se registra la alerta')}</strong></div><ArrowRight/><div><b>3</b><strong>{tr('Consulta su seguimiento')}</strong></div></div></section>
    <p className="sos-safety">{tr('Si existe peligro inmediato, contacta directamente a los servicios de emergencia de tu localidad. Esta aplicación no sustituye una llamada de emergencia.')}</p>
  </div>;
}
