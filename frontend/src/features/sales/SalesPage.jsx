
import { useMemo, useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Heart,
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

// Datos temporales para probar el frontend.
// Posteriormente serán reemplazados por la API.
const demoProducts = [
  {
    id: 1,
    name: 'Laptop Lenovo ThinkPad',
    price: 1800,
    category: 'Tecnología',
    location: 'Cayma',
    condition: 'Usado',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    createdAt: '2026-11-07'
  },
  {
    id: 2,
    name: 'Sofá de 3 cuerpos',
    price: 750,
    category: 'Hogar',
    location: 'Yanahuara',
    condition: 'Usado',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    createdAt: '2026-11-06'
  },
  {
    id: 3,
    name: 'Bicicleta MTB',
    price: 650,
    category: 'Deportes',
    location: 'Cercado',
    condition: 'Usado',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800',
    createdAt: '2026-11-05'
  },
  {
    id: 4,
    name: 'iPhone 12 (128 GB)',
    price: 2200,
    category: 'Tecnología',
    location: 'Cayma',
    condition: 'Usado',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
    createdAt: '2026-11-04'
  },
  {
    id: 5,
    name: 'Zapatillas deportivas',
    price: 320,
    category: 'Moda',
    location: 'Cerro Colorado',
    condition: 'Nuevo',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    createdAt: '2026-11-03'
  },
  {
    id: 6,
    name: 'Colección de libros',
    price: 150,
    category: 'Libros',
    location: 'Yanahuara',
    condition: 'Usado',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800',
    createdAt: '2026-11-02'
  },
  {
    id: 7,
    name: 'Control para videojuegos',
    price: 280,
    category: 'Tecnología',
    location: 'Cercado',
    condition: 'Usado',
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
    createdAt: '2026-11-01'
  },
  {
    id: 8,
    name: 'Casco para moto',
    price: 200,
    category: 'Vehículos',
    location: 'Paucarpata',
    condition: 'Usado',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800',
    createdAt: '2026-10-31'
  }
];

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
  }).format(price);

export default function SalesPage({
  products = demoProducts,
  onCreateSale,
  onViewSale
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('recent');
  const [favorites, setFavorites] = useState([]);

  // ==========================================
  // FILTRADO Y ORDENAMIENTO
  // ==========================================
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const name = String(
        product.name || product.title || ''
      ).toLowerCase();

      const description = String(
        product.description || ''
      ).toLowerCase();

      const matchesSearch =
        name.includes(query) ||
        description.includes(query);

      const matchesCategory =
        category === 'Todos' ||
        product.category === category;

      return matchesSearch && matchesCategory;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'price-asc') {
        return Number(a.price) - Number(b.price);
      }

      if (sortBy === 'price-desc') {
        return Number(b.price) - Number(a.price);
      }

      return new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0);
    });
  }, [products, search, category, sortBy]);

  // ==========================================
  // FAVORITOS TEMPORALES
  // ==========================================
  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  return (
    <section className="sales-page">

      {/* ENCABEZADO */}
      <div className="sales-hero">
        <div className="sales-hero-info">
          <div className="sales-hero-icon">
            <ShoppingCart size={27} />
          </div>

          <div>
            <h1>Ventas Locales</h1>
            <p>
              Compra, vende e intercambia productos
              en tu comunidad.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="sales-publish-btn"
          onClick={() => onCreateSale?.()}
        >
          <Plus size={18} />
          Publicar venta
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="sales-search">
        <Search size={20} />

        <input
          type="search"
          placeholder="Buscar productos en GeoFastPe..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />
      </div>

      {/* CATEGORÍAS */}
      <div className="sales-categories">
        {categories.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              className={`sales-category ${
                category === item.label
                  ? 'active'
                  : ''
              }`}
              onClick={() => setCategory(item.label)}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ENCABEZADO DEL CATÁLOGO */}
      <div className="sales-results-heading">
        <h2>
          Productos disponibles ({filteredProducts.length})
        </h2>

        <div className="sales-sort">
          <label htmlFor="sales-sort-select">
            Ordenar por:
          </label>

          <select
            id="sales-sort-select"
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
          >
            <option value="recent">
              Más recientes
            </option>
            <option value="price-asc">
              Menor precio
            </option>
            <option value="price-desc">
              Mayor precio
            </option>
          </select>
        </div>
      </div>

      {/* PRODUCTOS */}
      {filteredProducts.length > 0 ? (
        <div className="sales-grid">
          {filteredProducts.map((product) => {
            const isFavorite =
              favorites.includes(product.id);

            return (
              <article
                className="sales-card"
                key={product.id}
              >
                <div className="sales-card-image">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name || product.title}
                      loading="lazy"
                    />
                  ) : (
                    <div className="sales-image-placeholder">
                      <ShoppingCart size={38} />
                    </div>
                  )}

                  <button
                    type="button"
                    className={`sales-favorite ${
                      isFavorite ? 'active' : ''
                    }`}
                    onClick={() =>
                      toggleFavorite(product.id)
                    }
                    aria-label={
                      isFavorite
                        ? 'Quitar de favoritos'
                        : 'Agregar a favoritos'
                    }
                    aria-pressed={isFavorite}
                  >
                    <Heart
                      size={19}
                      fill={
                        isFavorite
                          ? 'currentColor'
                          : 'none'
                      }
                    />
                  </button>
                </div>

                <div className="sales-card-body">
                  <h3>
                    {product.name || product.title}
                  </h3>

                  <strong className="sales-price">
                    {formatPrice(product.price)}
                  </strong>

                  <div className="sales-location">
                    <MapPin size={14} />
                    <span>
                      {product.location || 'Sin ubicación'}
                    </span>
                  </div>

                  <span className="sales-category-badge">
                    {product.category || 'Otros'}
                  </span>

                  <button
                    type="button"
                    className="sales-detail-btn"
                    onClick={() =>
                      onViewSale?.(product)
                    }
                  >
                    Ver detalle
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="sales-empty">
          <ShoppingCart size={38} />
          <h3>No se encontraron productos</h3>
          <p>
            Prueba otra búsqueda o selecciona
            una categoría diferente.
          </p>
        </div>
      )}

    </section>
  );
}
