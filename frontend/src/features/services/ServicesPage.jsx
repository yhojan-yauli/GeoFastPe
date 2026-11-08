import { useMemo, useState } from 'react';
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
          <h1>🔧 Servicios Locales</h1>
          <p>Encuentra, ofrece o publica servicios en tu comunidad.</p>
        </div>

        <button type="button" className="services-create-button" onClick={handleCreate}>
          + Crear servicio
        </button>
      </header>

      <div className="services-search">
        <span>🔍</span>
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
              <div className="services-result-icon">🔧</div>

              <div className="services-result-info">
                <h3>{service.title}</h3>
                <p>{service.description || 'Servicio disponible en tu comunidad.'}</p>

                {Number.isFinite(service.distance) && (
                  <small>📍 A {(service.distance / 1000).toFixed(1)} km</small>
                )}

                <span className="services-category-label">
                  {service.category || service.type || 'Servicio'}
                </span>

                {service.phone && (
                  <a href={`tel:${service.phone}`}>📞 {service.phone}</a>
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
    </section>
  );
}
