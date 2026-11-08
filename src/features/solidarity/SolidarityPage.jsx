import { useMemo, useState } from 'react';
import { HeartHandshake, Plus, Search, Heart, MapPin, ArrowRight } from 'lucide-react';
import './SolidarityPage.css';

const categories = ['Todos', 'Alimentos', 'Ropa', 'Útiles', 'Salud', 'Otros'];

export default function SolidarityPage({
  donations = [],
  requests = [],
  onPublishDonation,
  onRequestHelp,
  onToggleFavorite
}) {
  const [tab, setTab] = useState('donations');
  const [category, setCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const entries = tab === 'donations' ? donations : requests;

  const filtered = useMemo(() => entries.filter((item) => {
    const text = `${item.title || ''} ${item.description || ''}`.toLocaleLowerCase('es');
    return (category === 'Todos' || item.category === category)
      && text.includes(search.toLocaleLowerCase('es').trim());
  }), [entries, category, search]);

  const switchTab = (next) => {
    setTab(next);
    setCategory('Todos');
    setSearch('');
  };

  return (
    <section className="solidarity-page">
      <div className="solidarity-container">
        <header className="solidarity-header">
          <div className="solidarity-heading">
            <span className="solidarity-heading-icon"><HeartHandshake size={25} /></span>
            <div>
              <h1>Solidaridad y Donaciones</h1>
              <p>Comparte recursos y ayuda a tu comunidad.</p>
            </div>
          </div>
          <button className="solidarity-primary" type="button" onClick={() => onPublishDonation?.()}>
            <Plus size={17} /> Publicar donación
          </button>
        </header>

        <div className="solidarity-panel">
          <div className="solidarity-tabs">
            <div className="solidarity-tab-group">
              <button type="button" className={tab === 'donations' ? 'active' : ''} onClick={() => switchTab('donations')}>Donaciones</button>
              <button type="button" className={tab === 'requests' ? 'active' : ''} onClick={() => switchTab('requests')}>Solicitudes</button>
            </div>
            <button type="button" className="solidarity-outline" onClick={() => onRequestHelp?.()}>
              Solicitar ayuda <ArrowRight size={15} />
            </button>
          </div>

          <div className="solidarity-search">
            <Search size={17} />
            <input aria-label="Buscar donaciones o solicitudes" placeholder="Buscar donaciones o solicitudes..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>

          <div className="solidarity-categories">
            {categories.map((item) => (
              <button type="button" key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>
            ))}
          </div>

          <div className="solidarity-list">
            {filtered.length === 0 ? (
              <div className="solidarity-empty">
                <HeartHandshake size={32} />
                <h3>No hay publicaciones para mostrar</h3>
                <p>Prueba otra búsqueda o categoría, o publica la primera.</p>
              </div>
            ) : filtered.map((item) => (
              <article className="solidarity-card" key={item.id}>
                {item.image ? (
                  <img className="solidarity-card-image" src={item.image} alt={item.title} />
                ) : (
                  <div className="solidarity-card-image solidarity-image-placeholder"><HeartHandshake size={27} /></div>
                )}
                <div className="solidarity-card-info">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <small><MapPin size={13} />{item.location || 'Ubicación no especificada'}</small>
                </div>
                <div className="solidarity-card-actions">
                  <button
                    type="button"
                    className={`solidarity-favorite ${item.favorito ? 'active' : ''}`}
                    onClick={() => onToggleFavorite?.(item)}
                    aria-label="Marcar favorito"
                    aria-pressed={item.favorito}
                  >
                    <Heart size={19} fill={item.favorito ? 'currentColor' : 'none'} />
                  </button>
                  <span className="solidarity-status">{item.status || (tab === 'requests' ? 'Solicitud' : 'Disponible')}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
