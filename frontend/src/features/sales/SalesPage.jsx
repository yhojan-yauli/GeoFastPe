import { useMemo, useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  MapPin,
  Laptop,
  House,
  Shirt,
  Bike,
  Car,
  BookOpen,
  Ellipsis,
  LayoutGrid
} from 'lucide-react';

import './SalesPage.css';

const categories = [
  { label: 'Todos', icon: LayoutGrid },
  { label: 'Tecnología', icon: Laptop },
  { label: 'Hogar', icon: House },
  { label: 'Moda', icon: Shirt },
  { label: 'Deportes', icon: Bike },
  { label: 'Vehículos', icon: Car },
  { label: 'Libros', icon: BookOpen },
  { label: 'Otros', icon: Ellipsis }
];

const formatPrice = (price) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0
  }).format(Number(price) || 0);

export default function SalesPage({
  products = [],
  onCreateSale,
  onViewSale
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('recent');

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const name = String(product.name || '').toLowerCase();
      const description = String(product.description || '').toLowerCase();
      const matchesSearch = name.includes(query) || description.includes(query);
      const matchesCategory = category === 'Todos' || product.category === category;
      return matchesSearch && matchesCategory;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
      if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [products, search, category, sortBy]);

  return (
    <section className="sales-page">
      <div className="sales-hero">
        <div className="sales-hero-info">
          <div className="sales-hero-icon">
            <ShoppingCart size={27} />
          </div>

          <div>
            <h1>Ventas Locales</h1>
            <p>Compra, vende e intercambia productos en tu comunidad.</p>
          </div>
        </div>

        <button type="button" className="sales-publish-btn" onClick={() => onCreateSale?.()}>
          <Plus size={18} />
          Publicar venta
        </button>
      </div>

      <div className="sales-search">
        <Search size={20} />
        <input
          type="search"
          placeholder="Buscar productos en GeoFastPe..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="sales-categories">
        {categories.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              className={`sales-category ${category === item.label ? 'active' : ''}`}
              onClick={() => setCategory(item.label)}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="sales-results-heading">
        <h2>Productos disponibles ({filteredProducts.length})</h2>

        <div className="sales-sort">
          <label htmlFor="sales-sort-select">Ordenar por:</label>
          <select id="sales-sort-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="recent">Más recientes</option>
            <option value="price-asc">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
          </select>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="sales-grid">
          {filteredProducts.map((product) => (
            <article className="sales-card" key={product.id}>
              <div className="sales-card-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} loading="lazy" />
                ) : (
                  <div className="sales-image-placeholder">
                    <ShoppingCart size={38} />
                  </div>
                )}
              </div>

              <div className="sales-card-body">
                <h3>{product.name}</h3>
                <strong className="sales-price">{formatPrice(product.price)}</strong>

                <div className="sales-location">
                  <MapPin size={14} />
                  <span>{product.location || 'Sin ubicación'}</span>
                </div>

                <span className="sales-category-badge">{product.category || 'Otros'}</span>

                <button type="button" className="sales-detail-btn" onClick={() => onViewSale?.(product)}>
                  Ver detalle
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="sales-empty">
          <ShoppingCart size={38} />
          <h3>No se encontraron productos</h3>
          <p>Prueba otra búsqueda o selecciona una categoría diferente.</p>
        </div>
      )}
    </section>
  );
}
