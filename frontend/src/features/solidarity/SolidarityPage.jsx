import { useMemo, useState } from 'react';
import { HeartHandshake, Plus, Search, Heart, MapPin, ArrowRight } from 'lucide-react';
import './SolidarityPage.css';

const demoDonations = [
  { id: 'demo-d1', title: 'Donación de víveres', description: 'Canasta de alimentos para compartir.', category: 'Alimentos', location: 'Zona de ejemplo', distance: '1.5 km', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80', status: 'Disponible' },
  { id: 'demo-d2', title: 'Ropa en buen estado', description: 'Prendas de vestir para donar.', category: 'Ropa', location: 'Zona de ejemplo', distance: '2.3 km', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&q=80', status: 'Disponible' },
  { id: 'demo-d3', title: 'Útiles escolares', description: 'Materiales escolares disponibles.', category: 'Útiles', location: 'Zona de ejemplo', distance: '3.8 km', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&q=80', status: 'Disponible' }
];
const categories = ['Todos', 'Alimentos', 'Ropa', 'Útiles', 'Salud', 'Otros'];

export default function SolidarityPage({ donations = demoDonations, requests = [], onPublishDonation, onRequestHelp }) {
  const [tab, setTab] = useState('donations');
  const [category, setCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState([]);
  const entries = tab === 'donations' ? donations : requests;
  const filtered = useMemo(() => entries.filter((item) => {
    const text = `${item.title || item.name || ''} ${item.description || ''}`.toLocaleLowerCase('es');
    return (category === 'Todos' || item.category === category) && text.includes(search.toLocaleLowerCase('es').trim());
  }), [entries, category, search]);
  const switchTab = (next) => { setTab(next); setCategory('Todos'); setSearch(''); };
  const toggleFavorite = (id) => setFavorites((prev) => prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]);

  return (
    <section className="solidarity-page">
      <div className="solidarity-container">
        <header className="solidarity-header">
          <div className="solidarity-heading"><span className="solidarity-heading-icon"><HeartHandshake size={25}/></span><div><h1>Solidaridad y Donaciones</h1><p>Comparte recursos y ayuda a tu comunidad.</p></div></div>
          <button className="solidarity-primary" type="button" onClick={() => onPublishDonation?.()}><Plus size={17}/> Publicar donación</button>
        </header>
        <div className="solidarity-panel">
          <div className="solidarity-tabs">
            <div className="solidarity-tab-group"><button type="button" className={tab === 'donations' ? 'active' : ''} onClick={() => switchTab('donations')}>Donaciones</button><button type="button" className={tab === 'requests' ? 'active' : ''} onClick={() => switchTab('requests')}>Solicitudes</button></div>
            <button type="button" className="solidarity-outline" onClick={() => onRequestHelp?.()}>Solicitar ayuda <ArrowRight size={15}/></button>
          </div>
          <div className="solidarity-search"><Search size={17}/><input aria-label="Buscar donaciones o solicitudes" placeholder="Buscar donaciones o solicitudes..." value={search} onChange={(e) => setSearch(e.target.value)}/></div>
          <div className="solidarity-categories">{categories.map((item) => <button type="button" key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
          <div className="solidarity-list">
            {filtered.length === 0 ? <div className="solidarity-empty"><HeartHandshake size={32}/><h3>No hay publicaciones para mostrar</h3><p>Prueba otra búsqueda o categoría.</p></div> : filtered.map((item) => <article className="solidarity-card" key={item.id}>
              {item.image ? <img className="solidarity-card-image" src={item.image} alt={item.title || 'Publicación solidaria'}/> : <div className="solidarity-card-image solidarity-image-placeholder"><HeartHandshake size={27}/></div>}
              <div className="solidarity-card-info"><h3>{item.title || item.name}</h3><p>{item.description}</p><small><MapPin size={13}/>{item.location || 'Ubicación no especificada'}{item.distance ? ` · ${item.distance}` : ''}</small></div>
              <div className="solidarity-card-actions"><button type="button" className={`solidarity-favorite ${favorites.includes(item.id) ? 'active' : ''}`} onClick={() => toggleFavorite(item.id)} aria-label="Marcar favorito"><Heart size={19} fill={favorites.includes(item.id) ? 'currentColor' : 'none'}/></button><span className="solidarity-status">{item.status || (tab === 'requests' ? 'Solicitud' : 'Disponible')}</span></div>
            </article>)}
          </div>
        </div>
        <p className="solidarity-demo-note">Las publicaciones de ejemplo son demostrativas y no representan disponibilidad real ni distancias verificadas.</p>
      </div>
    </section>
  );
}
