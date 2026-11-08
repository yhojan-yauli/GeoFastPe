import { Flag, MapPin, CalendarClock } from 'lucide-react';
import './Reports.css';

export default function ReportDetail({ report, onBack }) {
  if (!report) {
    return <section className="gf-reports">
      <button className="gf-back-link" onClick={onBack}>← Volver a Reportes</button>
      <p>No se seleccionó ningún reporte.</p>
    </section>;
  }

  return <section className="gf-reports gf-create-report">
    <button className="gf-back-link" onClick={onBack}>← Volver a Reportes</button>
    <header className="gf-reports-header"><div className="gf-reports-header-title"><Flag size={36}/><div><h1>Detalle del reporte</h1><p>Información de la incidencia comunitaria.</p></div></div></header>
    <article className="gf-report-form gf-detail">
      <div className="gf-detail-heading"><h2>{report.title}</h2><span className={`gf-status gf-status-${report.status?.toLowerCase().replaceAll(' ', '-')}`}>{report.status}</span></div>
      <p><strong>Categoría:</strong> {report.category}</p>
      <p><strong>Prioridad:</strong> {report.priority}</p>
      <p><MapPin size={17}/> {report.location || (report.lat != null ? `${report.lat.toFixed(5)}, ${report.lng.toFixed(5)}` : 'Sin ubicación')}</p>
      <p><CalendarClock size={17}/> {report.createdAt ? new Date(report.createdAt).toLocaleString('es-PE') : ''}</p>
      <h3>Descripción</h3>
      <p>{report.description}</p>
      {report.images?.length > 0 && <div className="gf-files">{report.images.map((url) => <img key={url} src={url} alt="Evidencia" style={{ width: 120, borderRadius: 8 }}/>)}</div>}
    </article>
  </section>;
}
