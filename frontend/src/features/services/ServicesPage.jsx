import { useMemo, useState } from 'react';
import { MapPin, Phone, Search, Wrench, Star, X } from 'lucide-react';
import { ratingsApi } from '../../api/index.js';
import { useAuth } from '../auth/AuthContext.jsx';
import './ServicesPage.css';

const categories = ['Todos', 'Hogar', 'Transporte', 'Salud', 'Educación', 'Otros'];

export default function ServicesPage({
  services = [],
  onCreateService,
  onRequireLogin
}) {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [ratingTarget, setRatingTarget] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [ratingNotice, setRatingNotice] = useState('');

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();
    return services.filter((service) => {
      const text = `${service.title || ''} ${service.description || ''}`.toLowerCase();
      const matchesSearch = text.includes(query);
      const matchesCategory = category === 'Todos' || service.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [services, search, category]);

  const handleCreate = () => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }
    onCreateService();
  };

  return (
    <section className="services-page">
      <header className="services-page-heading">
        <div>
          <h1><Wrench size={28} /> Servicios Locales</h1>
          <p>Encuentra, ofrece o publica servicios en tu comunidad.</p>
        </div>

        <button type="button" className="services-create-button" onClick={handleCreate}>
          + Crear servicio
        </button>
      </header>

      <div className="services-search">
        <span><Search size={18} /></span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar servicios en GeoFastPe..."
          aria-label="Buscar servicios"
        />
      </div>

      <div className="services-categories">
        {categories.map((item) => (
          <button key={item} type="button" className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>
            {item}
          </button>
        ))}
      </div>

      <h2>Servicios disponibles ({filteredServices.length})</h2>

      <div className="services-results">
        {filteredServices.length ? (
          filteredServices.map((service) => (
            <article key={service.id} className="services-result-card">
              <div className="services-result-icon"><Wrench size={24} /></div>

              <div className="services-result-info">
                <h3>{service.title}</h3>
                <p>{service.description || 'Servicio disponible en tu comunidad.'}</p>

                {Number.isFinite(service.distance) && (
                  <small><MapPin size={14} /> A {(service.distance / 1000).toFixed(1)} km</small>
                )}

                <span className="services-category-label">
                  {service.category || service.type || 'Servicio'}
                </span>

                {service.phone && (
                  <a href={`tel:${service.phone}`}><Phone size={14} /> {service.phone}</a>
                )}
                {isAuthenticated && service.ownerId && (
                  <button type="button" className="services-rate-button" onClick={() => { setRatingTarget(service); setRatingNotice(''); }}>
                    <Star size={14}/> Reseñar a @{service.ownerUsername || service.ownerName || 'usuario'}
                  </button>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="services-empty">
            <h3>No encontramos servicios</h3>
            <p>Prueba con otra categoría o modifica tu búsqueda.</p>
          </div>
        )}
      </div>
      {ratingTarget && <div className="services-rating-shade" onClick={() => setRatingTarget(null)}>
        <form className="services-rating-modal" onClick={e => e.stopPropagation()} onSubmit={async e => { e.preventDefault(); try { await ratingsApi.crear({ reviewedId: ratingTarget.ownerId, serviceId: ratingTarget.id, rating, comment }); setRatingNotice('Reseña guardada correctamente.'); setTimeout(() => setRatingTarget(null), 700); } catch (err) { setRatingNotice(err.message || 'No se pudo guardar la reseña.'); } }}>
          <button type="button" className="services-rating-close" onClick={() => setRatingTarget(null)}><X size={18}/></button>
          <h2>Reseñar servicio</h2><p>{ratingTarget.title} · {ratingTarget.ownerName || 'Usuario'}</p>
          <div className="services-rating-stars">{[1,2,3,4,5].map(n => <button type="button" key={n} className={n <= rating ? 'on' : ''} onClick={() => setRating(n)}><Star size={28} fill="currentColor"/></button>)}</div>
          <textarea value={comment} onChange={e=>setComment(e.target.value)} maxLength={500} placeholder="¿Cómo fue el servicio?"/>
          {ratingNotice && <small>{ratingNotice}</small>}<button className="services-rate-submit">Guardar reseña</button>
        </form>
      </div>}
    </section>
  );
}
