import { ArrowLeft, Flag, MapPin, CalendarClock } from 'lucide-react';
import { usePreferences } from '../../preferences/PreferencesContext.jsx';
import './Reports.css';

export default function ReportDetail({ report, onBack }) {
  const { tr, language } = usePreferences();
  if (!report) {
    return <section className="gf-reports">
      <button className="gf-back-link" onClick={onBack}><ArrowLeft size={16} /> {tr('Volver a Reportes')}</button>
      <p>{tr('No se seleccionó ningún reporte.')}</p>
    </section>;
  }

  return <section className="gf-reports gf-create-report">
    <button className="gf-back-link" onClick={onBack}><ArrowLeft size={16} /> {tr('Volver a Reportes')}</button>
    <header className="gf-reports-header"><div className="gf-reports-header-title"><Flag size={36}/><div><h1>{tr('Detalle del reporte')}</h1><p>{tr('Información de la incidencia comunitaria.')}</p></div></div></header>
    <article className="gf-report-form gf-detail">
      <div className="gf-detail-heading"><h2>{report.title}</h2><span className={`gf-status gf-status-${report.status?.toLowerCase().replaceAll(' ', '-')}`}>{tr(report.status)}</span></div>
      <p><strong>{tr('Categoría:')}</strong> {tr(report.category)}</p>
      <p><strong>{tr('Prioridad:')}</strong> {tr(report.priority)}</p>
      <p><MapPin size={17}/> {report.location || (report.lat != null ? `${report.lat.toFixed(5)}, ${report.lng.toFixed(5)}` : tr('Sin ubicación'))}</p>
      <p><CalendarClock size={17}/> {report.createdAt ? new Date(report.createdAt).toLocaleString(language || 'es-PE') : ''}</p>
      <h3>{tr('Descripción')}</h3>
      <p>{report.description}</p>
      {report.images?.length > 0 && <div className="gf-files">{report.images.map((url) => <img key={url} src={url} alt={tr('Evidencia')} style={{ width: 120, borderRadius: 8 }}/>)}</div>}
    </article>
  </section>;
}
