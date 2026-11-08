
import { useAuth } from '../../features/auth/AuthContext.jsx';
import { canAccessSection } from '../../features/auth/permissions.js';
import './Sidebar.css';

import {
  House,
  MapPinned,
  BriefcaseBusiness,
  ShoppingCart,
  HeartHandshake,
  Siren,
  Flag,
  CalendarDays,
  MessageCircle,
  UserRound,
  Settings
} from 'lucide-react';

// ==========================================
// CONFIGURACIÓN DEL MENÚ
// ==========================================

const menuItems = [
  { label: 'Inicio', icon: House, path: '/', category: 'Todos' },
  { label: 'Servicios', icon: BriefcaseBusiness, path: '/servicios', category: 'Servicios' },
  { label: 'Ventas', icon: ShoppingCart, path: '/ventas', category: 'Ventas' },
  { label: 'Solidaridad', icon: HeartHandshake, path: '/solidaridad', category: 'Solidaridad' },
  { label: 'Emergencias (SOS)', icon: Siren, path: '/emergencias', category: 'Emergencia' },
  { label: 'Reportes', icon: Flag, path: '/reportes', category: 'Reportes' },
  { label: 'Eventos', icon: CalendarDays, path: '/eventos', category: 'Eventos' },
  { label: 'Mensajes', icon: MessageCircle, path: '/mensajes', category: 'Mensajes' },
  { label: 'Mi Perfil', icon: UserRound, path: '/perfil', category: 'Mi Perfil' },
  { label: 'Configuración', icon: Settings, path: '/configuracion', category: 'Configuración' }
];

// ==========================================
// SECCIONES PÚBLICAS
// ==========================================

const PUBLIC_SECTIONS = [
  'Inicio',
  'Mapa Vecinal',
  'Servicios',
  'Ventas',
  'Solidaridad',
  'Emergencias (SOS)',
  'Reportes',
  'Eventos'
];

// ==========================================
// COMPONENTE SIDEBAR
// ==========================================

export default function Sidebar({
  section,
  onSelectSection,
  onRequireLogin
}) {
  const { isAuthenticated } = useAuth();

  // ==========================================
  // CONTROL DE NAVEGACIÓN
  // ==========================================

  const handleNavigation = (name, category) => {
    // Las secciones públicas no requieren login.
    if (PUBLIC_SECTIONS.includes(name)) {
      onSelectSection?.(name, category);
      return;
    }

    // Las secciones privadas requieren autenticación.
    if (!canAccessSection(name, isAuthenticated)) {
      onRequireLogin?.(name);
      return;
    }

    onSelectSection?.(name, category);
  };

  // ==========================================
  // DETECTAR SECCIÓN ACTIVA
  // ==========================================

  const isActiveSection = (label) => {
    if (section === label) return true;

    // Compatibilidad con el nombre interno
    // de Emergencias utilizado por App.jsx.
    if (
      label === 'Emergencias (SOS)' &&
      section === 'Emergencias'
    ) {
      return true;
    }

    return false;
  };

  // ==========================================
  // INTERFAZ DEL SIDEBAR
  // ==========================================

  return (
    <aside className="left-sidebar gf-sidebar">

      {/* =====================================
          ENCABEZADO GEOFASTPE
      ===================================== */}

      <div className="gf-brand">
        <div className="gf-brand-name">
          <span className="gf-brand-geo">
            
          </span>

          <span className="gf-brand-pe">
            
          </span>
        </div>
      </div>

      {/* =====================================
          CONTENIDO DEL MENÚ
      ===================================== */}

      <div className="gf-sidebar-content">

        <div className="gf-nav-caption">
          MENÚ PRINCIPAL
        </div>

        <nav
          className="gf-navigation"
          aria-label="Menú principal"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = isActiveSection(item.label);

            return (
              <button
                key={item.path}
                type="button"
                className={`gf-nav-item ${
                  isSelected ? 'selected' : ''
                }`}
                onClick={() =>
                  handleNavigation(
                    item.label,
                    item.category
                  )
                }
                title={item.label}
                aria-current={
                  isSelected ? 'page' : undefined
                }
              >

                {/* ICONO */}
                <span className="gf-nav-icon">
                  <Icon
                    size={20}
                    strokeWidth={1.8}
                  />
                </span>

                {/* NOMBRE DEL MÓDULO */}
                <span className="gf-nav-label">
                  {item.label}
                </span>

                {/* INDICADOR ACTIVO */}
                {isSelected && (
                  <span
                    className="gf-nav-active"
                    aria-hidden="true"
                  />
                )}

              </button>
            );
          })}
        </nav>

      </div>

      {/* =====================================
          DECORACIÓN INFERIOR
          TODO: conservar o mejorar el fondo
          de la Catedral de Arequipa desde CSS.
      ===================================== */}

      <div
        className="gf-scenery"
        aria-hidden="true"
      />

      {/* =====================================
          PIE DE PÁGINA
      ===================================== */}

      <div className="gf-sidebar-bottom">

        <div className="gf-avatar">
          GF
        </div>

        <div className="gf-footer-info">
          <strong>GeoFastPe</strong>
          <small>Plataforma comunitaria</small>
        </div>

      </div>

    </aside>
  );
}

// ==========================================
// FUTURAS IMPLEMENTACIONES
// ==========================================

// TODO (navegación):
// Integrar rutas reales si se incorpora
// React Router. Actualmente la navegación
// depende de App.jsx mediante callbacks.

// TODO (autenticación):
// Mostrar indicadores visuales de acceso
// restringido en Mensajes, Mi Perfil
// y Configuración.

// TODO (notificaciones):
// Agregar contador de mensajes no leídos
// cuando el backend proporcione ese dato.

// TODO (mapa):
// Mantener sincronizada la categoría activa
// con los filtros del motor GeoFastPe.

// TODO (responsive):
// Incorporar menú colapsable para móviles.
